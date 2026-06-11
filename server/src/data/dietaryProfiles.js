export const dietaryProfileGroups = [
  {
    id: "lifestyle",
    label: "Lifestyle / preference",
    description: "Eating patterns and food preferences.",
    options: [
      {
        id: "omnivore",
        label: "Omnivore / no preference",
        description: "Prefer balanced meals with lean protein, vegetables, and moderate portions."
      },
      {
        id: "vegetarian",
        label: "Vegetarian",
        description: "Avoid meat, poultry, and seafood."
      },
      {
        id: "vegan",
        label: "Vegan",
        description: "Avoid animal products including dairy, eggs, honey, and butter."
      },
      {
        id: "pescatarian",
        label: "Pescatarian",
        description: "Allow seafood while avoiding meat and poultry."
      },
      {
        id: "flexitarian",
        label: "Flexitarian",
        description: "Favor plant-forward choices and lean proteins."
      },
      {
        id: "mediterranean",
        label: "Mediterranean",
        description: "Favor fish, vegetables, legumes, olive oil, and whole grains."
      },
      {
        id: "keto",
        label: "Keto / very low carb",
        description: "Favor protein and non-starchy vegetables while avoiding starches and sugar."
      },
      {
        id: "paleo",
        label: "Paleo",
        description: "Favor meats, seafood, eggs, vegetables, fruit, and nuts while limiting grains and dairy."
      }
    ]
  },
  {
    id: "health",
    label: "Health / medical",
    description: "Health-oriented nutrition goals.",
    options: [
      {
        id: "low-carb",
        label: "Low carb",
        description: "Reduce refined carbs, desserts, sugary sauces, and large starch portions."
      },
      {
        id: "high-protein",
        label: "High protein",
        description: "Favor protein-forward meals built around lean meat, seafood, tofu, eggs, or legumes."
      },
      {
        id: "gluten-free",
        label: "Gluten-free",
        description: "Flag wheat, pasta, breading, buns, flour tortillas, croutons, soy sauce, and baked goods."
      },
      {
        id: "low-sodium",
        label: "Low sodium",
        description: "Flag processed meats, soups, sauces, soy sauce, fried foods, pickled items, and cured meats."
      },
      {
        id: "low-sugar",
        label: "Low sugar / diabetic-friendly",
        description: "Favor lean protein and vegetables while flagging desserts, sweet sauces, and refined carbs."
      },
      {
        id: "heart-healthy",
        label: "Heart-healthy",
        description: "Favor grilled fish, lean proteins, vegetables, legumes, whole grains, and olive oil."
      }
    ]
  },
  {
    id: "restrictions",
    label: "Restrictions / exclusions",
    description: "Religious dietary needs, exclusions, and allergy-aware guidance.",
    options: [
      {
        id: "dairy-free",
        label: "Dairy-free",
        description: "Flag cheese, cream, butter, ranch, yogurt, milk, and creamy sauces."
      },
      {
        id: "halal",
        label: "Halal",
        description: "Flag pork, alcohol-based sauces, and uncertain meat sourcing."
      },
      {
        id: "kosher",
        label: "Kosher",
        description: "Flag pork, shellfish, meat-and-dairy combinations, and uncertain preparation."
      },
      {
        id: "allergy-aware",
        label: "Allergy-aware",
        description: "Use selected allergen flags and include cross-contact guidance."
      }
    ]
  }
];

export const allergySubOptions = [
  { id: "nuts", label: "Nuts" },
  { id: "shellfish", label: "Shellfish" },
  { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" },
  { id: "sesame", label: "Sesame" }
];

export function findProfileById(profileId) {
  for (const group of dietaryProfileGroups) {
    const match = group.options.find((option) => option.id === profileId);
    if (match) {
      return {
        ...match,
        groupId: group.id,
        groupLabel: group.label
      };
    }
  }

  return null;
}

export function getAllergyLabel(allergyId) {
  return allergySubOptions.find((option) => option.id === allergyId)?.label || allergyId;
}
