export interface iCreateMailTemplate {
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables?: Record<string, string>;
  // ou variables?: { [key: string]: string };
}

export interface iSendMailInfo {
  to: string;
  template_name: string;
  variables: Record<string, string>;
  // ou { [key: string]: string }
}