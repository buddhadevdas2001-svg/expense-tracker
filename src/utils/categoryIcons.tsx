import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import CategoryIcon from '@mui/icons-material/Category';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import MovieIcon from '@mui/icons-material/Movie';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HomeIcon from '@mui/icons-material/Home';
import FlightIcon from '@mui/icons-material/Flight';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CoffeeIcon from '@mui/icons-material/Coffee';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MedicationIcon from '@mui/icons-material/Medication';
import SmartphoneIcon from '@mui/icons-material/Smartphone';

type IconComponent = ComponentType<SvgIconProps>;

export const PREDEFINED_ICON_OPTIONS: Array<{ key: string; Icon: IconComponent }> = [
  { key: 'category', Icon: CategoryIcon },
  { key: 'fastfood', Icon: FastfoodIcon },
  { key: 'directions_car', Icon: DirectionsCarIcon },
  { key: 'shopping_bag', Icon: ShoppingBagIcon },
  { key: 'movie', Icon: MovieIcon },
  { key: 'lightbulb', Icon: LightbulbIcon },
  { key: 'local_hospital', Icon: LocalHospitalIcon },
  { key: 'menu_book', Icon: MenuBookIcon },
  { key: 'home', Icon: HomeIcon },
  { key: 'flight', Icon: FlightIcon },
  { key: 'sports_esports', Icon: SportsEsportsIcon },
  { key: 'coffee', Icon: CoffeeIcon },
  { key: 'local_pizza', Icon: LocalPizzaIcon },
  { key: 'fitness_center', Icon: FitnessCenterIcon },
  { key: 'medication', Icon: MedicationIcon },
  { key: 'smartphone', Icon: SmartphoneIcon },
];

const ICON_MAP: Record<string, IconComponent> = PREDEFINED_ICON_OPTIONS.reduce(
  (acc, option) => {
    acc[option.key] = option.Icon;
    return acc;
  },
  {} as Record<string, IconComponent>,
);

export function renderCategoryIcon(icon: string | undefined | null, props?: SvgIconProps) {
  const Icon = icon ? ICON_MAP[icon] : undefined;
  const ResolvedIcon = Icon ?? CategoryIcon;
  return <ResolvedIcon {...props} />;
}
