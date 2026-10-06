import {
  BookOpen,
  ChefHat,
  CircleHelp,
  Laptop,
  Package,
  Scissors,
  Shirt,
  Wrench,
} from 'lucide-react';

const icons = {
  book: BookOpen,
  laptop: Laptop,
  scissors: Scissors,
  wrench: Wrench,
  shirt: Shirt,
  utensils: ChefHat,
  pencil: BookOpen,
  package: Package,
};

export default function CategoryIcon({ name, size = 16, className = '' }) {
  const Icon = icons[name] || CircleHelp;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
