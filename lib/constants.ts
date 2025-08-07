import {
  bookingStatusEnum,
  lessonStatusEnum,
  languagesEnum,
  EventStatusEnum,
  locationEnum,
  userRole,
} from "@/drizzle/migrations/schema";

export const LESSON_STATUS_ENUM_VALUES = lessonStatusEnum.enumValues;
export type LessonStatus = (typeof LESSON_STATUS_ENUM_VALUES)[number];

export const BOOKING_STATUSES = bookingStatusEnum.enumValues;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const LANGUAGES_ENUM_VALUES = languagesEnum.enumValues;
export type Language = (typeof LANGUAGES_ENUM_VALUES)[number];

export const EVENT_STATUS_ENUM_VALUES = EventStatusEnum.enumValues;
export type EventStatus = (typeof EVENT_STATUS_ENUM_VALUES)[number];

export const LOCATION_ENUM_VALUES = locationEnum.enumValues;
export type Location = (typeof LOCATION_ENUM_VALUES)[number];

export const USER_ROLE_ENUM_VALUES = userRole.enumValues;
export type UserRole = (typeof USER_ROLE_ENUM_VALUES)[number];