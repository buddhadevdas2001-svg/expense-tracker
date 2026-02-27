import type { ElementType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import RestaurantIcon from '@mui/icons-material/Restaurant';
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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import TrainIcon from '@mui/icons-material/Train';
import PaymentsIcon from '@mui/icons-material/Payments';

const ICON_MAP: Record<string, ElementType<SvgIconProps>> = {
  attach_money: CurrencyRupeeIcon,
  restaurant: RestaurantIcon,
  directions_car: DirectionsCarIcon,
  shopping_bag: ShoppingBagIcon,
  movie: MovieIcon,
  lightbulb: LightbulbIcon,
  local_hospital: LocalHospitalIcon,
  menu_book: MenuBookIcon,
  home: HomeIcon,
  flight: FlightIcon,
  sports_esports: SportsEsportsIcon,
  coffee: CoffeeIcon,
  local_pizza: LocalPizzaIcon,
  fitness_center: FitnessCenterIcon,
  medication: MedicationIcon,
  smartphone: SmartphoneIcon,
  account_balance: AccountBalanceIcon,
  trending_up: TrendingUpIcon,
  work: WorkIcon,
  school: SchoolIcon,
  train: TrainIcon,
  payments: PaymentsIcon,
};

const LEGACY_ICON_MAP: Record<string, string> = {
  '💰': 'attach_money',
  '🍔': 'restaurant',
  '🚗': 'directions_car',
  '🛍️': 'shopping_bag',
  '🎬': 'movie',
  '💡': 'lightbulb',
  '🏥': 'local_hospital',
  '📚': 'menu_book',
  '🏠': 'home',
  '✈️': 'flight',
  '🎮': 'sports_esports',
  '☕': 'coffee',
  '🍕': 'local_pizza',
  '🏋️': 'fitness_center',
  '💊': 'medication',
  '📱': 'smartphone',
};

export const CATEGORY_ICON_OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'payments', label: 'General' },
  { key: 'attach_money', label: 'Money' },
  { key: 'account_balance', label: 'Bank' },
  { key: 'trending_up', label: 'Investment' },
  { key: 'work', label: 'Work' },
  { key: 'restaurant', label: 'Food' },
  { key: 'directions_car', label: 'Transport' },
  { key: 'shopping_bag', label: 'Shopping' },
  { key: 'movie', label: 'Entertainment' },
  { key: 'lightbulb', label: 'Utilities' },
  { key: 'local_hospital', label: 'Healthcare' },
  { key: 'menu_book', label: 'Books' },
  { key: 'school', label: 'Education' },
  { key: 'home', label: 'Home' },
  { key: 'flight', label: 'Travel' },
  { key: 'sports_esports', label: 'Gaming' },
  { key: 'coffee', label: 'Coffee' },
  { key: 'local_pizza', label: 'Pizza' },
  { key: 'fitness_center', label: 'Fitness' },
  { key: 'medication', label: 'Medicine' },
  { key: 'smartphone', label: 'Mobile' },
  { key: 'train', label: 'Train' },
];

const normalizeIconKey = (icon: string | null | undefined) => {
  if (!icon) return 'payments';
  if (ICON_MAP[icon]) return icon;
  if (LEGACY_ICON_MAP[icon]) return LEGACY_ICON_MAP[icon];
  return 'payments';
};

const resolveIconKey = (icon: string | null | undefined, categoryName?: string | null) => {
  if (categoryName?.trim().toLowerCase() === 'salary') return 'attach_money';
  return normalizeIconKey(icon);
};

export const renderCategoryIcon = (
  icon: string | null | undefined,
  props?: SvgIconProps,
  categoryName?: string | null
) => {
  const key = resolveIconKey(icon, categoryName);
  const Icon = ICON_MAP[key] ?? PaymentsIcon;
  return <Icon {...props} />;
};
