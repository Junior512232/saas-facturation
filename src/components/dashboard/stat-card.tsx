import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  variation: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({ 
  title, 
  value, 
  variation, 
  icon: Icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary"
}: StatCardProps) {
  return (
    <Card className="rounded-2xl border-border shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">{value}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${variation.isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {variation.isPositive ? '+' : ''}{variation.value}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
