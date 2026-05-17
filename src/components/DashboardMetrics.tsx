'use client'

import { motion } from 'framer-motion'
import { Activity, CheckCircle2, MessageSquare, Award } from 'lucide-react'

export default function DashboardMetrics({ activeWorks, completedWorks, totalPosts }: { activeWorks: number, completedWorks: number, totalPosts: number }) {
  const metrics = [
    {
      title: 'Active Work',
      value: activeWorks,
      icon: <Activity className="text-primary" size={20} />,
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      description: 'Items in progress'
    },
    {
      title: 'Completed',
      value: completedWorks,
      icon: <CheckCircle2 className="text-emerald-400" size={20} />,
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      description: 'Successfully shipped'
    },
    {
      title: 'Brain Storms',
      value: totalPosts,
      icon: <MessageSquare className="text-blue-400" size={20} />,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      description: 'Asynchronous momentum'
    },
    {
      title: 'Workspace Health',
      value: '98%',
      icon: <Award className="text-amber-400" size={20} />,
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      description: 'Active asynchronously'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`relative overflow-hidden p-5 rounded-2xl border ${metric.borderColor} bg-secondary/15 backdrop-blur-md hover:bg-secondary/20 transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm font-semibold text-muted-foreground">{metric.title}</span>
            <div className={`p-2 rounded-xl ${metric.bgColor}`}>
              {metric.icon}
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-black text-white">{metric.value}</h3>
            <p className="text-[10px] md:text-xs text-muted-foreground">{metric.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
