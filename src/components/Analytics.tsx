import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Brain, Clock, Target, Calendar, Award } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  // Mock analytics data
  const weeklyProgress = [
    { day: 'Mon', studied: 45, mastered: 12 },
    { day: 'Tue', studied: 32, mastered: 8 },
    { day: 'Wed', studied: 58, mastered: 15 },
    { day: 'Thu', studied: 41, mastered: 11 },
    { day: 'Fri', studied: 67, mastered: 18 },
    { day: 'Sat', studied: 23, mastered: 6 },
    { day: 'Sun', studied: 39, mastered: 10 },
  ];

  const categoryProgress = [
    { category: 'Vocabulary', value: 85, color: 'hsl(var(--primary))' },
    { category: 'Grammar', value: 72, color: 'hsl(var(--secondary))' },
    { category: 'Reading', value: 68, color: 'hsl(var(--accent))' },
    { category: 'Writing', value: 45, color: 'hsl(var(--muted))' },
  ];

  const studyStreak = [
    { week: 'Week 1', days: 5 },
    { week: 'Week 2', days: 7 },
    { week: 'Week 3', days: 6 },
    { week: 'Week 4', days: 7 },
    { week: 'Week 5', days: 4 },
    { week: 'Week 6', days: 7 },
  ];

  const chartConfig = {
    studied: {
      label: "Cards Studied",
      color: "hsl(var(--primary))",
    },
    mastered: {
      label: "Cards Mastered",
      color: "hsl(var(--secondary))",
    },
    days: {
      label: "Study Days",
      color: "hsl(var(--accent))",
    },
  };

  const stats = [
    {
      title: "Total Cards Studied",
      value: "1,247",
      change: "+12%",
      icon: Brain,
      color: "text-primary"
    },
    {
      title: "Current Streak",
      value: "23 days",
      change: "+5 days",
      icon: Calendar,
      color: "text-secondary"
    },
    {
      title: "Study Time",
      value: "47h 32m",
      change: "+8h",
      icon: Clock,
      color: "text-accent"
    },
    {
      title: "Accuracy Rate",
      value: "89.2%",
      change: "+3.1%",
      icon: Target,
      color: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your learning progress and achievements</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className={`text-sm ${stat.color} flex items-center mt-1`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted/20`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal text-xl">
                <TrendingUp className="w-5 h-5" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgress}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="studied" 
                      stroke="var(--color-studied)" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mastered" 
                      stroke="var(--color-mastered)" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Study Streak Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal text-xl">
                <Calendar className="w-5 h-5" />
                Study Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyStreak}>
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="days" 
                      fill="var(--color-days)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Progress and Achievement Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Progress Pie Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal text-xl">
                <Target className="w-5 h-5" />
                Progress by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <ChartContainer config={chartConfig} className="h-[250px] w-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryProgress}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryProgress.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="space-y-4">
                  {categoryProgress.map((category, index) => (
                    <div key={index} className="flex items-center gap-3 ">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium text-foreground">{category.category}</span>
                      <span className="text-sm text-muted-foreground ml-auto">{category.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal text-xl">
                <Award className="w-5 h-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Week Warrior</p>
                  <p className="text-sm text-muted-foreground">7 day streak</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Quick Learner</p>
                  <p className="text-sm text-muted-foreground">100 cards mastered</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Accuracy Expert</p>
                  <p className="text-sm text-muted-foreground">90% accuracy rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;