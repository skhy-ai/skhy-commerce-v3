export interface NavLink {
  name: string;
  href?: string;
  items?: { name: string; href: string }[];
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
}

export interface Industry {
  id: string;
  name: string;
  icon: string;
  description: string;
  image: string;
  actionText?: string;
  actionUrl?: string;
}

export interface EngagementStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Whitepaper {
  id: string;
  title: string;
  abstract: string;
  downloadUrl: string;
  image: string;
  email?: string;
  phone?: string;
  equipmentImage?: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  url: string;
}
export interface TechStackDetails {
  [key: string]: string;
}

export interface TechStack {
  title: string;
  description: string;
  frameworks: string[];
  techniques: string[];
  security: string[];
  hardware?: string[];
  details: TechStackDetails;
}

export interface techStackMapping {
  [key: string]: TechStack;
}