import Link from "next/link";
import {
  HelmetIcon,
  HeadsetIcon,
  PackageIcon,
  BookingIcon,
  KiteIcon,
  PaymentIcon,
  UsersIcon,
  BookIcon,
  CalendarIcon,
  FlagIcon,
  LocationIcon,
  ClockIcon,
  AdminIcon,
  EquipmentIcon,
} from "@/svgs";

const entityData = [
  {
    name: "Student",
    icon: HelmetIcon,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    link: "/students",
    description: [
      "Students create bookings.",
      "Can only have one active booking at a time.",
    ],
  },
  {
    name: "Teacher",
    icon: HeadsetIcon,
    color: "text-green-500",
    bgColor: "bg-green-500",
    link: "/teachers",
    description: [
      "Our employees, each has a commission rate for a lesson and earn money.",
      "Payments are used to deduct earnings from the total.",
    ],
    many_to_many: [
      {
        name: "Teacher Kite",
        link: "/teachers",
        icon: KiteIcon,
        color: "text-lime-500",
        bgColor: "bg-lime-500",
      },
    ],
  },
  {
    name: "Package",
    icon: PackageIcon,
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    link: "/packages",
    description: [
      "Determines the duration, capacity, and kites for the booking.",
    ],
  },
  {
    name: "Booking",
    icon: BookingIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    link: "/bookings",
    description: [
      "Has a start date and end date.",
      "References come from user accounts.",
    ],
    many_to_many: [
      {
        name: "Booking Student",
        link: "/bookings",
        icon: AdminIcon,
        color: "text-gray-500",
        bgColor: "bg-gray-500",
      },
    ],
  },
  {
    name: "Lesson",
    icon: FlagIcon,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500",
    link: "/lessons",
    description: [
      "Represents a scheduled lesson, linked to a teacher, booking, and commission.",
    ],
  },
  {
    name: "Event",
    icon: CalendarIcon,
    color: "text-fuchsia-500",
    bgColor: "bg-fuchsia-500",
    link: "/events",
    description: [
      "Must be derived from a lesson.",
      "Has a duration and kite that was used.",
    ],
    many_to_many: [
      {
        name: "Kite Event",
        link: "/events",
        icon: KiteIcon,
        color: "text-brown-500",
        bgColor: "bg-brown-500",
      },
    ],
  },
  {
    name: "Kite",
    icon: KiteIcon,
    color: "text-teal-500",
    bgColor: "bg-teal-500",
    link: "/kites",
    description: ["Added and used for tracking of usage in each event."],
  },
  {
    name: "Payment",
    icon: PaymentIcon,
    color: "text-teal-500",
    bgColor: "bg-teal-500",
    link: "/payments",
    description: ["Records payments made to teachers."],
  },
  {
    name: "User Wallet",
    icon: UsersIcon,
    color: "text-pink-500",
    bgColor: "bg-pink-500",
    link: "/users",
    description: [
      "Manages user roles.",
      "Links to Supabase authentication users and teachers.",
      "Used for references of bookings.",
    ],
  },
  {
    name: "Commission",
    icon: BookIcon,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500",
    link: "/teachers",
    description: [
      "Defines the commission rate for a teacher.",
      "Must be selected when creating a lesson.",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Documentation Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entityData.map((entity) => (
          <div
            key={entity.name}
            className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4"
          >
            <Link
              href={entity.link}
              className="flex items-center justify-between mb-2"
            >
              <div className="flex items-center">
                <entity.icon className={`w-8 h-8 mr-4 ${entity.color}`} />
                <span className="text-lg font-semibold">{entity.name}</span>
              </div>
              <div className={`w-4 h-4 rounded-full ${entity.bgColor}`}></div>
            </Link>
            <ul className="list-disc list-inside text-lg text-muted-foreground mb-4">
              {entity.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>
            {entity.many_to_many && (
              <div className="ml-4 mt-2">
                <ul className="space-y-2">
                  {entity.many_to_many.map((m2m) => (
                    <li
                      key={m2m.name}
                      className="pb-2 border-b border-gray-200 last:border-b-0"
                    >
                      <Link href={m2m.link} className="block">
                        <div className="flex items-center px-2 py-1 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                          <m2m.icon className={`w-6 h-6 mr-2 ${m2m.color}`} />
                          <span className="text-base">{m2m.name}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
