import developmentWorkImage from "../assets/d.jpg";
import officeWorkImage from "../assets/c2.webp";
import creativeWorkImage from "../assets/c1.png";
import adminWorkImage from "../assets/p.jpg";

const categories = [
  "Any type of work",
  "Development & IT",
  "Design & Creative",
  "Finance & Accounting",
  "Admin & Customer Support",
  
  "Legal",
  "Sales & Marketing",
];

const jobs = [
  { title: "Administrative Assistant", category: "Admin & Customer Support", description: "Support a remote team with scheduling, email, and day-to-day operations.", budget: 450, duration: "1 to 3 months" },
  { title: "Ad Creative Freelancer", category: "Sales & Marketing", description: "Create campaign concepts and engaging content for digital channels.", budget: 600, duration: "Less than 1 month" },
  { title: "Adobe Acrobat Expert", category: "Design & Creative", description: "Prepare accessible, polished PDF documents and reusable templates.", budget: 350, duration: "Less than 1 month" },
  { title: "Adobe After Effects Specialist", category: "Design & Creative", description: "Produce motion graphics and short animated assets for a product launch.", budget: 750, duration: "1 to 3 months" },
  { title: "Mobile App Developer", category: "Development & IT", description: "Build and refine a cross-platform mobile application.", budget: 1800, duration: "3 to 6 months" },
  { title: "Motion Graphics Designer", category: "Design & Creative", description: "Design a set of motion graphics for web and social media.", budget: 900, duration: "1 to 3 months" },
  { title: "Paralegal", category: "Legal", description: "Help organize legal documents and conduct case research.", budget: 500, duration: "1 to 3 months" },
  { title: "Payroll Specialist", category: "Finance & Accounting", description: "Review payroll records and support monthly reporting.", budget: 650, duration: "Less than 1 month" },
];

export {
  categories,
  jobs,
  developmentWorkImage,
  officeWorkImage,
  creativeWorkImage,
  adminWorkImage,
};
