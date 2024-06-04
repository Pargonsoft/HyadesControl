const styles = {
  // styles
  bold: [1, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  // grayscale
  white: [37, 39],
  grey: [90, 39],
  black: [90, 39],
  // colors
  blue: [34, 39],
  cyan: [36, 39],
  green: [32, 39],
  magenta: [35, 39],
  red: [91, 39],
  yellow: [33, 39],
};

export type StylesNames =
  | "bold"
  | "italic"
  | "underline"
  | "inverse"
  | "white"
  | "grey"
  | "black"
  | "blue"
  | "cyan"
  | "green"
  | "magenta"
  | "red"
  | "yellow";

export const levels = {
  error: { id: 1, color: "red" },
  warn: { id: 2, color: "yellow" },
  info: { id: 3, color: "green" },
  verbose: { id: 4, color: "blue" },
  debug: { id: 5, color: "cyan" },
  silly: { id: 6, color: "magenta" },
};

function colorizeStart(style: StylesNames) {
  return style ? `\x1B[${styles[style][0]}m` : "";
}

function colorizeEnd(style: StylesNames) {
  return style ? `\x1B[${styles[style][1]}m` : "";
}

/**
 * Taken from masylum's fork (https://github.com/masylum/log4js-node)
 */
export function colorize(str: string, style: StylesNames) {
  return colorizeStart(style) + str + colorizeEnd(style);
}
