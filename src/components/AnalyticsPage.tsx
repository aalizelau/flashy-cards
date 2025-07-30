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
    { category: 'Vocabulary', value: 85, color: 'hsl(var(--muted-foreground))' },
    { category: 'Grammar', value: 72, color: 'hsl(var(--muted-foreground))' },
    { category: 'Reading', value: 68, color: 'hsl(var(--muted-foreground))' },
    { category: 'Writing', value: 45, color: 'hsl(var(--muted-foreground))' },
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
      color: "hsl(var(--muted-foreground))",
    },
    mastered: {
      label: "Cards Mastered", 
      color: "hsl(var(--muted-foreground))",
    },
    days: {
      label: "Study Days",
      color: "hsl(var(--muted-foreground))",
    },
  };

  const stats = [
    {
      title: "Total Cards Studied",
      value: "1,247",
      change: "+12%",
      icon: Brain,
      color: "text-muted-foreground"
    },
    {
      title: "Current Streak", 
      value: "23 days",
      change: "+5 days",
      icon: Calendar,
      color: "text-muted-foreground"
    },
    {
      title: "Study Time",
      value: "47h 32m",
      change: "+8h",
      icon: Clock,
      color: "text-muted-foreground"
    },
    {
      title: "Accuracy Rate",
      value: "89.2%",
      change: "+3.1%",
      icon: Target,
      color: "text-muted-foreground"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-bg p-6 font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground font-light">Track your learning progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow border-muted/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-normal text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-light text-foreground">{stat.value}</p>
                    <p className={`text-sm ${stat.color} flex items-center mt-1 font-light`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted/10`}>
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
          <Card className="border-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal text-lg">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
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
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mastered" 
                      stroke="var(--color-mastered)" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Study Streak Chart */}
          <Card className="border-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal text-lg">
                <Calendar className="w-5 h-5 text-muted-foreground" />
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
          <Card className="lg:col-span-2 border-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal text-lg">
                <Target className="w-5 h-5 text-muted-foreground" />
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
                    <div key={index} className="flex items-center gap-3">
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
          <Card className="border-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-normal text-lg">
                <Award className="w-5 h-5 text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/10">
                <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-normal text-foreground">Completed session</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/10">
                <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-normal text-foreground">Studied 45 cards</p>
                  <p className="text-sm text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/10">
                <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-normal text-foreground">New milestone</p>
                  <p className="text-sm text-muted-foreground">3 days ago</p>
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