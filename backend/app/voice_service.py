import os
import re
import hashlib
import requests
import redis
import time
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Supported languages for Google TTS
SUPPORTED_TTS_LANGUAGES = {
    'en': 'en',      # English
    'es': 'es',      # Spanish  
    'fr': 'fr',      # French
    'de': 'de',      # German
    'it': 'it',      # Italian
    'uk': 'uk',      # Ukrainian
    'zh': 'zh-cn',   # Chinese (Simplified)
    'ja': 'ja'       # Japanese
}


class VoiceGenerator:
    def __init__(self, redis_host: str = None, redis_port: int = 6379, redis_db: int = 0, use_redis: bool = True):
        """
        Initialize VoiceGenerator with optional Redis connection
        
        Args:
            redis_host: Redis server host
            redis_port: Redis server port  
            redis_db: Redis database number
            use_redis: Whether to use Redis caching
        """
        self.use_redis = use_redis
        self.memory_cache = {}  # Fallback in-memory cache
        
        if use_redis:
            try:
                # Use environment variable or fallback to localhost
                host = redis_host or os.getenv('REDIS_HOST', 'localhost')
                self.redis_client = redis.Redis(host=host, port=redis_port, db=redis_db, decode_responses=True)
                # Test connection
                self.redis_client.ping()
                logger.info(f"Connected to Redis at {host}:{redis_port}")
            except (redis.ConnectionError, redis.TimeoutError) as e:
                logger.warning(f"Redis not available, using in-memory cache: {e}")
                self.use_redis = False
                self.redis_client = None
        else:
            self.redis_client = None
            
        self.tts_url = "https://translate.google.com/translate_tts"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def _strip_spaces(self, word: str) -> str:
        """Strip and normalize spaces in word"""
        return re.sub(r'\s+', ' ', word.strip())
    
    def _generate_cache_key(self, lang: str, cleaned_word: str) -> str:
        """Generate Redis cache key"""
        return f"voice:{lang}:{cleaned_word}"
    
    def is_language_supported(self, lang: str) -> bool:
        """Check if language is supported for TTS"""
        return lang in SUPPORTED_TTS_LANGUAGES
    
    def _get_tts_language_code(self, lang: str) -> str:
        """Get the correct TTS language code for Google API"""
        return SUPPORTED_TTS_LANGUAGES.get(lang, lang)
    
    def _generate_file_path(self, lang: str, cleaned_word: str) -> Path:
        """Generate file path using SHA1 hash"""
        sha1_hash = hashlib.sha1(cleaned_word.encode('utf-8')).hexdigest()
        # Use absolute path to ensure consistency
        base_dir = Path(__file__).parent.parent  # Go up to backend directory
        voices_dir = base_dir / "voices" / lang
        voices_dir.mkdir(parents=True, exist_ok=True)
        return voices_dir / f"{sha1_hash}.mp3"
    
    def _download_voice(self, lang: str, cleaned_word: str) -> str:
        """Download voice from Google TTS API"""
        tts_lang_code = self._get_tts_language_code(lang)
        params = {
            'ie': 'UTF-8',
            'q': cleaned_word,
            'tl': tts_lang_code,
            'client': 'tw-ob'
        }
        
        response = requests.get(self.tts_url, params=params, headers=self.headers, timeout=10)
        response.raise_for_status()
        
        # Save to file
        file_path = self._generate_file_path(lang, cleaned_word)
        with open(file_path, 'wb') as f:
            f.write(response.content)
        
        logger.info(f"Downloaded TTS for '{cleaned_word}' in {lang} to {file_path}")
        # Return relative path for consistency with database storage
        return str(file_path.relative_to(Path(__file__).parent.parent))
    
    def get_voice(self, lang: str, word: str) -> Optional[str]:
        """
        Get voice file from cache or Google TTS API with fault tolerance
        
        Args:
            lang: Language code (e.g., 'en', 'es', 'fr')
            word: Text to convert to speech
            
        Returns:
            str: Path to saved audio file, or None if failed or unsupported language
        """
        try:
            # 1. Check if language is supported
            if not self.is_language_supported(lang):
                logger.info(f"Language '{lang}' not supported for TTS - skipping audio generation")
                return None
            
            # 2. Strip spaces
            cleaned_word = self._strip_spaces(word)
            
            # 3. Check cache (Redis or memory)
            cache_key = self._generate_cache_key(lang, cleaned_word)
            
            if self.use_redis and self.redis_client:
                cached_path = self.redis_client.get(cache_key)
            else:
                cached_path = self.memory_cache.get(cache_key)
            
            # 4. If cached and file exists, return cached path
            if cached_path:
                # Handle both absolute and relative paths
                if os.path.exists(cached_path):
                    return cached_path
                # Try with backend prefix for relative paths
                backend_path = Path(__file__).parent.parent / cached_path
                if backend_path.exists():
                    return str(backend_path.relative_to(Path(__file__).parent.parent))
            
            # 5. Download new voice file
            file_path = self._download_voice(lang, cleaned_word)
            
            # 6. Cache the file path
            if self.use_redis and self.redis_client:
                self.redis_client.set(cache_key, file_path)
            else:
                self.memory_cache[cache_key] = file_path
            
            return file_path
            
        except Exception as e:
            logger.error(f"Failed to get voice for '{word}' in {lang}: {e}")
            return None
    
    def clear_cache(self, lang: Optional[str] = None, word: Optional[str] = None):
        """
        Clear cache entries
        
        Args:
            lang: Specific language to clear (optional)
            word: Specific word to clear (optional)
        """
        try:
            if self.use_redis and self.redis_client:
                if lang and word:
                    # Clear specific entry
                    cleaned_word = self._strip_spaces(word)
                    cache_key = self._generate_cache_key(lang, cleaned_word)
                    self.redis_client.delete(cache_key)
                elif lang:
                    # Clear all entries for language
                    pattern = f"voice:{lang}:*"
                    keys = self.redis_client.keys(pattern)
                    if keys:
                        self.redis_client.delete(*keys)
                else:
                    # Clear all voice cache
                    pattern = "voice:*"
                    keys = self.redis_client.keys(pattern)
                    if keys:
                        self.redis_client.delete(*keys)
            else:
                # Memory cache clearing
                if lang and word:
                    cleaned_word = self._strip_spaces(word)
                    cache_key = self._generate_cache_key(lang, cleaned_word)
                    self.memory_cache.pop(cache_key, None)
                elif lang:
                    # Clear all entries for language
                    keys_to_remove = [k for k in self.memory_cache.keys() if k.startswith(f"voice:{lang}:")]
                    for key in keys_to_remove:
                        del self.memory_cache[key]
                else:
                    # Clear all voice cache
                    self.memory_cache.clear()
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")


# Global instance
voice_generator = VoiceGenerator()