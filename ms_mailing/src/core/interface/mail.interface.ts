export interface iCreateMailTemplate {
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables?: { string: string };
}

export interface iSendMailInfo {
  to: string;
  template_name: string;
  variables: { string: string };
}
