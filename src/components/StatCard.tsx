import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'safe';
}

const StatCard = ({ title, value, icon: Icon, variant = 'default' }: StatCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'border-danger/50 bg-danger/5';
      case 'warning':
        return 'border-warning/50 bg-warning/5';
      case 'safe':
        return 'border-safe/50 bg-safe/5';
      default:
        return 'border-primary/50 bg-primary/5';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'danger':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'safe':
        return 'text-safe';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className={`transition-all hover:scale-105 ${getVariantStyles()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${getIconColor()}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${getIconColor()}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
