interface GrafanaParams {
  driver: string;
  headers: Record<string, string>;
}

export const generateGrafanaLink = ({ driver, headers }: GrafanaParams) => {
  const url = new URL(driver);
  const params = new URLSearchParams({
    from: 'now-1h',
    to: 'now',
    ...headers
  });
  
  return `${url.origin}${url.pathname}?${params}`;
}; 