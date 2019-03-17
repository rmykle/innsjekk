const elements = [
  {
    name: "BI-student",
    icon: "money",
    desc:
      "Selger pyramidespill som varmt hvetebrød i påvente av å bli sertifisert eiendomsmegler",
    effect_desc:
      "Gir 5 mer credits per innsjekk, pluss 2% av vinnerbudet på auksjon",
    getValue: function(count) {
      return 2 * count;
    },
    getPrice: function(count) {
      return Math.floor(1 + Math.pow(count, 1.9));
    }
  },
  {
    name: "HF-student",
    icon: "format_paint",
    desc:
      "I og for seg flittig, men innholdet er nok ikke relevant til oppgaven din (eller noe annet forsåvidt), men sider er da sider",
    effect_desc: "Skriver to sider per tick",
    getValue: function() {
      return 2;
    },
    getPrice: function(count) {
      return Math.floor(1 + Math.pow(count, 1.9));
    }
  },
  {
    name: "JUS-student",
    icon: "account_balance",
    desc:
      "Meget flittig, men må fores daglig med ritalin. Jobber derfor kun dagene man har sjekket inn",
    effect_desc: "Skriver 5 sider per tick etter innlogging",
    getValue: function() {
      return 5;
    },
    getPrice: function(count) {
      return Math.floor(1 + Math.pow(count, 1.9));
    }
  },
  {
    name: "Type med APP-Idé",
    icon: "face",
    desc:
      'Utvid kontaktnettverket med folk som oser over av gode idéer som overføres direkte til credits. "Like Facebook but for cats"',
    effect_desc:
      "0.3% av antall sider gjøres om til credit per tick hvis du er sjekket inn, ellers 0.1%",
    getValue: function(score, count, loggedIn) {
      const value = score * ((loggedIn ? 0.003 : 0.001) * count);

      return value;
    },
    getPrice: function(count) {
      return Math.floor(1 + Math.pow(count, 1.9));
    }
  }
];

export const mappedUserElements = user => {
  return elements.map(element => {
    const storedCount = user.upgrades[element.name];
    const count = storedCount ? storedCount : 0;
    const nextPrice = element.getPrice(count);

    return {
      count: count,
      nextPrice: nextPrice,
      icon: element.icon,
      desc: element.desc,
      effect_desc: element.effect_desc,
      name: element.name
    };
  });
};

export default elements;
