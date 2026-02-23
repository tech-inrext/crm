export type BranchKey = "Noida" | "Lucknow" | "Patna" | "Delhi";

export const BRANCH_LABELS: Record<BranchKey, string> = {
  Noida:
    "Noida: 3rd floor, D4, Block -D, Sector -10, Noida, Uttar Pradesh 201301.",
  Lucknow: "Lucknow: 312, Felix, Square, Sushant Golf City, Lucknow 226030.",
  Patna:
    "Patna: 4th floor, Pandey Plaza, Exhibition Road, Patna, Bihar 800001.",
  Delhi: "Plot No. 29, 4th Floor, Moti Nagar, New Delhi-110015",
};

export const SLAB_OPTIONS: string[] = [
  "",
  "100",
  "95",
  "90",
  "80",
  "70",
  "60",
  "50",
];

export const getSlabLabel = (opt: string) =>
  opt === ""
    ? "Select a slab"
    : `${opt}%` +
      (opt === "100"
        ? " President"
        : opt === "95"
          ? " V.P."
          : opt === "90"
            ? " A.V.P. (Core Member)"
            : opt === "80"
              ? " General Manager"
              : opt === "70"
                ? " Senior Manager"
                : opt === "60"
                  ? " Manager"
                  : " (Sales Executive)");

export const formatBranchForMenu = (label: string) =>
  label.split(", ").join(",\n");
