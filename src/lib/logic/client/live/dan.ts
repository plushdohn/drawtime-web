export function encode(args: (string | number | null)[]) {
  let res = "";

  args.forEach((arg, i) => {
    if (typeof arg === "number") {
      res += arg;
    } else if (arg !== null) {
      res += `"${arg}"`;
    }

    if (i < args.length - 1) {
      res += "|";
    }
  });

  return res;
}

export function decode(data: string) {
  const args = data.split("|");

  let res: (string | number | null)[] = [];

  for (const arg of args) {
    if (arg.charAt(0) === `"`) res.push(arg.slice(1, -1));
    else if (arg.charAt(0) === "") res.push(null);
    else res.push(Number(arg));
  }

  return res;
}

export function encodeEvent(kind: string, args: (string | number | null)[]) {
  return encode([kind, ...args]);
}

export function decodeEvent(data: string) {
  const [kind, ...args] = decode(data);

  return {
    kind: kind as string,
    payload: args,
  };
}
