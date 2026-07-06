export type NavItem = {
  title: string;
  url: string;
  icon: string;
  exact?: boolean;
  notActiveFor?: string[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const adminNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: "LayoutDashboard",
        exact: true,
      },
    ],
  },
  {
    label: "Exams",
    items: [
      {
        title: "All Exams",
        url: "/admin/exams",
        icon: "FileText",
        notActiveFor: ["/admin/exams/new", "/admin/exams/[id]"],
      },
      { title: "Create Exam", url: "/admin/exams/new", icon: "PlusCircle" },
      { title: "Question Bank", url: "/admin/questions", icon: "BookOpen" },
    ],
  },
  {
    label: "People",
    items: [
      { title: "Users", url: "/admin/users", icon: "Users", exact: true },
    ],
  },
  {
    label: "Reports",
    items: [{ title: "Results", url: "/admin/results", icon: "BarChart3" }],
  },
];

export const examinerNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/examiner",
        icon: "LayoutDashboard",
        exact: true,
      },
    ],
  },
  {
    label: "Exams",
    items: [
      {
        title: "All Exams",
        url: "/examiner/exams",
        icon: "FileText",
        notActiveFor: ["/examiner/exams/new", "/examiner/exams/[id]"],
      },
      { title: "Create Exam", url: "/examiner/exams/new", icon: "PlusCircle" },
      { title: "Question Bank", url: "/examiner/questions", icon: "BookOpen" },
    ],
  },
  {
    label: "Reports",
    items: [{ title: "Results", url: "/examiner/results", icon: "BarChart3" }],
  },
];

export const proctorNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/proctor",
        icon: "LayoutDashboard",
        exact: true,
      },
    ],
  },
  {
    label: "Exams",
    items: [{ title: "All Exams", url: "/proctor/exams", icon: "FileText" }],
  },
  {
    label: "Reports",
    items: [{ title: "Results", url: "/proctor/results", icon: "BarChart3" }],
  },
];

export const studentNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/student",
        icon: "LayoutDashboard",
        exact: true,
      },
    ],
  },
  {
    label: "Exams",
    items: [{ title: "My Exams", url: "/student/exams", icon: "FileText" }],
  },
  {
    label: "Reports",
    items: [{ title: "Results", url: "/student/results", icon: "BarChart3" }],
  },
];
