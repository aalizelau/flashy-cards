FROM ghcr.io/astral-sh/uv:python3.13-alpine

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN uv pip install --system --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app
COPY ./alembic /code/alembic         
COPY ./alembic.ini /code/alembic.ini 

CMD ["fastapi", "run", "app/main.py", "--port", "80"]