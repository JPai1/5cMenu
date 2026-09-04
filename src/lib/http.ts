const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

export async function fetchText(
  url: string,
  init: RequestInit = {},
  revalidate = 900,
): Promise<string> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "user-agent": BROWSER_UA,
      accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      ...init.headers,
    },
    signal: init.signal ?? AbortSignal.timeout(22_000),
    next: { revalidate },
  });
  if (!response.ok) {
    throw new Error(`${response.status} fetching ${url}`);
  }
  return response.text();
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  revalidate = 900,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "user-agent": BROWSER_UA,
      accept: "application/json",
      ...init.headers,
    },
    signal: init.signal ?? AbortSignal.timeout(22_000),
    next: { revalidate },
  });
  if (!response.ok) {
    throw new Error(`${response.status} fetching ${url}`);
  }
  return response.json() as Promise<T>;
}
