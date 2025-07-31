export const moduleOptions = [
  { value: "1", label: "Mathematics" },
  { value: "2", label: "Physics" },
  { value: "3", label: "Chemistry" },
  { value: "4", label: "Biology" },
  { value: "5", label: "Computer Science" },
  { value: "6", label: "Electrical Engineering" },
  { value: "7", label: "Mechanical Engineering" },
  { value: "8", label: "Economics" },
  { value: "9", label: "Psychology" },
] as OptionType[];

export const timeOptions = [
  { value: "8:30", label: "8:30 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:45", label: "11:45 AM" },
  { value: "1:15", label: "1:15 PM" },
] as OptionType[];

export const teacherOptions = [
  { value: "1", label: "Dr. John Doe" },
  { value: "2", label: "Dr. Jane Smith" },
  { value: "3", label: "Dr. Emily Taylor" },
  { value: "4", label: "Dr. Michael Brown" },
] as const;

export const doctorOptions = [
  { value: "1", label: "Dr. Sarah Lee" },
  { value: "2", label: "Dr. James Bond" },
  { value: "3", label: "Dr. Peter Parker" },
] as OptionType[];

export type OptionType = {
  value: string;
  label: string;
};
