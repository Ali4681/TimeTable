import React from "react";
import { Home } from "lucide-react"; // Assuming lucide-react is installed
import { cva, type VariantProps } from "class-variance-authority"; // Assuming class-variance-authority is installed
import { useTranslation } from "react-i18next"; // Assuming react-i18next is setup
import i18n from "@/lib/i18n";

// Mock cn utility if not available in the environment.
// In a real project, this would come from "@/lib/utils" or a similar path.
const cn = (...inputs: any[]) => {
  return inputs
    .flat(Infinity)
    .filter(
      (input) =>
        typeof input === "string" ||
        (typeof input === "object" && input !== null)
    )
    .map((input) => {
      if (typeof input === "string") {
        return input;
      }
      // Handling objects like { 'class-name': true }
      if (typeof input === "object" && input !== null) {
        return Object.keys(input)
          .filter((key) => input[key])
          .join(" ");
      }
      return "";
    })
    .filter(Boolean)
    .join(" ");
};

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-black text-white hover:bg-neutral-800 focus-visible:ring-neutral-700 dark:bg-[#364151] dark:text-white dark:hover:bg-[#4F6272] dark:focus-visible:ring-white dark:ring-offset-neutral-900", // Changed dark mode background to #364151, text to white, and updated hover/focus
        secondary:
          "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:ring-offset-gray-900",
        outline:
          "border border-blue-600 text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-800 dark:ring-offset-gray-900",
        ghost:
          "hover:bg-gray-100 focus-visible:ring-gray-400 dark:hover:bg-gray-700 dark:ring-offset-gray-900",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600 dark:ring-offset-gray-900",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
      fullWidth: {
        true: "w-full",
      },
      theme: {
        // This 'theme' variant is defined but not actively switching core bg/text colors here. Dark mode is via Tailwind prefixes.
        light: "",
        dark: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      theme: "light", // Default theme context, primarily for Tailwind's dark: prefix to work if html class="dark"
    },
  }
);

export interface RoomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  label?: string;
  responsive?: boolean;
  loading?: boolean;
  // theme prop is part of buttonVariants, useful if you extend cva to use it more directly or for other conditional logic.
}

const RoomButton = React.forwardRef<HTMLButtonElement, RoomButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      icon = <Home className="h-4 w-4" />, // Default icon
      label = "Add New Room", // Default label
      responsive = true,
      loading = false,
      theme, // theme can be passed to buttonVariants
      ...props
    },
    ref
  ) => {
    // Mock useTranslation if not available in the environment
    const { t, i18n } = useTranslation
      ? useTranslation()
      : { t: (key: string) => key, i18n: { language: "en" } };
    const currentLabel = label ? t(label) : "";

    const direction = i18n.language === "ar" ? "rtl" : "ltr";

    // Determine the effective theme for cva.
    // If the component receives a theme prop, use it. Otherwise, it relies on defaultVariants or Tailwind's dark mode.
    const effectiveTheme = theme;

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
            theme: effectiveTheme, // Pass theme to cva
            // The className prop allows for additional custom classes to be merged.
            // Responsive and loading classes are applied conditionally.
            className: [
              className,
              responsive ? "sm:min-w-[120px]" : "",
              loading ? "opacity-70 pointer-events-none" : "",
            ]
              .filter(Boolean)
              .join(" "), // Filter out empty strings before joining
          })
        )}
        disabled={loading || props.disabled} // Also respect props.disabled
        {...props}
        dir={direction} // Set text direction
      >
        {loading ? (
          <span className="inline-flex items-center">
            {/* Loading spinner SVG */}
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4" // Adjusted margin for LTR/RTL consistency
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {/* Loading text, responsive */}
            {label && ( // Only show "Loading..." if there was a label to begin with
              <span className={responsive ? "hidden sm:inline" : "inline"}>
                {t("Loading...")}
              </span>
            )}
          </span>
        ) : (
          <>
            {/* Icon, with conditional margin based on label presence and text direction */}
            {icon && (
              <span
                className={label ? (direction === "rtl" ? "ml-2" : "mr-2") : ""}
              >
                {icon}
              </span>
            )}
            {/* Label text, responsive */}
            {label && (
              <span className={responsive ? "hidden sm:inline" : "inline"}>
                {currentLabel}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

RoomButton.displayName = "RoomButton";

// Example App component to demonstrate the button
// In a real application, you would import RoomButton and use it.
// Make sure Tailwind CSS is setup in your project.
// Also ensure react-i18next is configured if you use translations.
// Lucide-react icons should be installed.

// Default export for the App component
export default function App() {
  // Mock i18n setup for demonstration if not available globally
  if (!useTranslation) {
    // A very basic mock if i18next is not fully set up in this environment
    (window as any).i18n = {
      language: "en",
      changeLanguage: (lang: string) =>
        console.log(`Language changed to ${lang}`),
    };
    (window as any).t = (key: string) => key;
  }

  const [isLoading, setIsLoading] = React.useState(false);
  const [currentTheme, setCurrentTheme] = React.useState<"light" | "dark">(
    "light"
  );

  const toggleLoading = () => setIsLoading(!isLoading);
  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(newTheme);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  // Example of how to use the i18n for dynamic labels if needed
  // For this example, we'll stick to the default "Add New Room" or pass static strings.

  return (
    <div
      className={`p-4 space-y-4 ${
        currentTheme === "dark" ? "dark bg-neutral-900" : "bg-white"
      }`}
    >
      <div className="flex space-x-2 mb-4">
        <button
          onClick={toggleLoading}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
        >
          Toggle Loading
        </button>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
        >
          Toggle Theme ({currentTheme})
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        RoomButton Variants
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Primary Button (Now with #364151 in dark mode) */}
        <div>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Primary (Default - Dark BG #364151)
          </p>
          <RoomButton
            variant="primary"
            loading={isLoading}
            label="Primary Action"
            icon={<Home className="h-4 w-4" />}
          />
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Primary Large
          </p>
          <RoomButton
            variant="primary"
            size="lg"
            loading={isLoading}
            label="Large Primary"
            icon={<Home className="h-5 w-5" />}
          />
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Primary Small (Icon Only on Small Screens)
          </p>
          <RoomButton
            variant="primary"
            size="sm"
            loading={isLoading}
            label="Small"
            icon={<Home className="h-3 w-3" />}
            responsive={true}
          />
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Primary (Icon only, non-responsive label)
          </p>
          <RoomButton
            variant="primary"
            loading={isLoading}
            icon={<Home className="h-4 w-4" />}
            responsive={false}
          />
        </div>

        {/* Secondary Button */}
        <div>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Secondary
          </p>
          <RoomButton
            variant="secondary"
            loading={isLoading}
            label="Secondary Action"
          />
        </div>

        {/* Outline Button */}
        <div>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Outline
          </p>
          <RoomButton
            variant="outline"
            loading={isLoading}
            label="Outline Action"
          />
        </div>

        {/* Ghost Button */}
        <div>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Ghost</p>
          <RoomButton
            variant="ghost"
            loading={isLoading}
            label="Ghost Action"
          />
        </div>

        {/* Destructive Button */}
        <div>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Destructive
          </p>
          <RoomButton
            variant="destructive"
            loading={isLoading}
            label="Delete Action"
          />
        </div>

        {/* Full Width Button */}
        <div className="md:col-span-2 lg:col-span-3">
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Primary Full Width
          </p>
          <RoomButton
            variant="primary"
            fullWidth
            loading={isLoading}
            label="Full Width Primary"
          />
        </div>
      </div>

      {/* Example with Arabic label for RTL testing */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          RTL Example (العربية)
        </h3>
        <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
          Primary (Arabic Label)
        </p>
        <RoomButton
          variant="primary"
          loading={isLoading}
          label="إضافة غرفة جديدة" // Arabic for "Add New Room"
          icon={<Home className="h-4 w-4" />}
          onClick={() => {
            // Temporarily switch language for this button's dir attribute
            const originalLang = i18n.language;
            // To properly test RTL, you would typically change the language globally
            // using i18n.changeLanguage('ar') and ensure your component re-renders.
            // For this demo, we'll just log it. The `dir` attribute on the button
            // should be dynamically set by the useTranslation hook based on i18n.language.
            if (i18n.language !== "ar") {
              console.log(
                "Simulating Arabic language for RTL test. Actual i18n state may differ."
              );
              // In a real app: i18n.changeLanguage('ar');
            } else {
              console.log("Language is already Arabic.");
            }
          }}
        />
      </div>
    </div>
  );
}

// Export the button and variants if they are to be used by other modules
export { RoomButton, buttonVariants };
