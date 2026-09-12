import { redirect } from 'next/navigation';

export default function RootPage() {
  // Client requirement: Website is not required, Property Management is the main focus.
  // Direct entry goes straight to Staff PMS Front Desk.
  redirect('/staff');
}
