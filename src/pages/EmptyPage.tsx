import { LucideIcon } from 'lucide-react';

interface EmptyPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function EmptyPage({ title, description, icon: Icon }: EmptyPageProps) {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

export default EmptyPage;