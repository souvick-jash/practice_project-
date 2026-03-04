export const capitalize = (str: string) => {
  if (!str.length) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const fullSubdomain = (str: string) => {
  if (!str.length) return "";
  return `${str}.${import.meta.env.VITE_MAIN_DOMAIN}`;
};

export const fullSubdomainUrl = (str: string) => {
  const protocol =
    import.meta.env.VITE_NODE_ENV === "production" ? "https" : "http";

  if (!str.length) return "";
  return `${protocol}://${str}.${import.meta.env.VITE_MAIN_DOMAIN}`;
};

type NameParts = {
  firstName: string;
  lastName: string;
};

export function splitFullName(fullName: string): NameParts {
  const [firstName = "", ...lastParts] = fullName.trim().split(/\s+/);
  const lastName = lastParts.join(" ");
  return { firstName, lastName };
}

export const properCase = (raw: string): string => {
  return raw
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function generateRandomId() {
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return `#UID${result}`;
}
