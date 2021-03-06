function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const props = {
  fontSize: { prefix: "text", prop: "font-size" }
};

const SIDES = ["top", "right", "bottom", "left"];
const CORNERS = ["top-left", "top-right", "bottom-right", "bottom-left"];
const AXES = ["x", "y"];

export default function (_ref) {
  let { suffix = "-fluid" } = _ref,
      properties = _objectWithoutProperties(_ref, ["suffix"]);

  return function ({ e, addUtilities, config }) {
    const classes = [];

    Object.keys(properties).forEach(property => {
      const values = properties[property] === true ? config(property) : properties[property];

      Object.keys(values).forEach(id => {
        const prop = props[property].prop;

        if (typeof values[id] === "string" || typeof values[id] === "number") {
          const className = `${props[property].prefix}-${id}${suffix}`;
          const selector = `.${e(className)}`;

          classes.push({
            [selector]: {
              [prop]: property === "negativeMargin" ? `-${values[id]}` : values[id]
            }
          });
          return;
        }

        const { min, max, minvw, maxvw } = values[id];

        const variants = [""];
        if (props[property].axes) {
          variants.push(...AXES);
        }
        if (props[property].sides) {
          variants.push(...SIDES);
        }
        if (props[property].corners) {
          variants.push(...CORNERS);
        }

        variants.forEach(v => {
          const className = `${props[property].prefix}${shorthand(v, props[property].hyphen)}-${id}${suffix}`;
          const selector = `.${e(className)}`;
          const p = propNames(prop, v, props[property].corners);

          classes.push({
            [selector]: p.reduce((acc, curr) => {
              acc[curr] = property === "negativeMargin" ? `-${min}` : min;
              return acc;
            }, {}),
            [`@media (min-width: ${minvw})`]: {
              [selector]: p.reduce((acc, curr) => {
                acc[curr] = makeFluid(values[id], property === "negativeMargin");
                return acc;
              }, {})
            },
            [`@media (min-width: ${maxvw})`]: {
              [selector]: p.reduce((acc, curr) => {
                acc[curr] = property === "negativeMargin" ? `-${max}` : max;
                return acc;
              }, {})
            }
          });
        });
      });
    });

    addUtilities(classes);
  };
}

function makeFluid({ minvw, maxvw, min, max }, negate = false) {
  const mn = negate ? `-${min}` : min;
  const mx = negate ? `-${max}` : max;

  return `calc(${mn} + ${parseFloat(mx) - parseFloat(mn)} * (100vw - ${minvw}) / ${parseFloat(maxvw) - parseFloat(minvw)})`;
}

function shorthand(longhand, hyphen = true) {
  if (longhand === "") return "";
  return (hyphen ? "-" : "") + longhand.match(/\b[a-z]/g).join("");
}

function propNames(prop, variant, corners) {
  if (!variant) return [prop];

  let variants = [variant];

  if (variant === "x") {
    variants = ["left", "right"];
  } else if (variant === "y") {
    variants = ["top", "bottom"];
  } else if (variant === "top" && corners) {
    variants = ["top-left", "top-right"];
  } else if (variant === "right" && corners) {
    variants = ["top-right", "bottom-right"];
  } else if (variant === "bottom" && corners) {
    variants = ["bottom-left", "bottom-right"];
  } else if (variant === "left" && corners) {
    variants = ["top-left", "bottom-left"];
  }

  const parts = prop.split("-");
  if (parts.length === 1) {
    return variants.map(v => `${parts[0]}-${v}`);
  }

  return variants.map(v => `${parts[0]}-${v}-${parts.slice(1).join("-")}`);
}