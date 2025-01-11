// Height calculation utilities
const convertHeightToInches = (heightStr) => {
  try {
    const [feet, inches] = heightStr
      .split("'")
      .map((num) => parseInt(num.trim()));
    return feet * 12 + (inches || 0); // Handle cases where inches might be missing
  } catch (error) {
    console.error(`Error parsing height: ${heightStr}`);
    return 72; // Default to 6'0" if parsing fails
  }
};

const calculateHeightScore = (roster) => {
  const heightsInInches = roster.map((p) => convertHeightToInches(p.height));
  const avgHeightInches =
    heightsInInches.reduce((sum, h) => sum + h, 0) / roster.length;

  const minHeight = 72; // 6'0"
  const idealMinHeight = 78; // 6'6"
  const idealMaxHeight = 81; // 6'9"
  const maxHeight = 84; // 7'0"

  let heightScore;
  if (avgHeightInches < minHeight) {
    heightScore = 0;
  } else if (
    avgHeightInches >= idealMinHeight &&
    avgHeightInches <= idealMaxHeight
  ) {
    heightScore = 100;
  } else if (avgHeightInches < idealMinHeight) {
    heightScore =
      ((avgHeightInches - minHeight) / (idealMinHeight - minHeight)) * 100;
  } else {
    heightScore = Math.max(
      0,
      100 -
        ((avgHeightInches - idealMaxHeight) / (maxHeight - idealMaxHeight)) *
          100
    );
  }

  return Math.min(100, Math.max(0, heightScore));
};

// Individual scoring category calculations
const calculatePositionBalance = (roster) => {
  const requiredPositions = ["PG", "SG", "SF", "PF", "C"];
  const primaryPositions = roster.map((p) => p.primaryPosition);
  const secondaryPositions = roster
    .map((p) => p.secondaryPosition)
    .filter(Boolean);
  const coveredPositions = new Set([
    ...primaryPositions,
    ...secondaryPositions,
  ]);
  return (coveredPositions.size / requiredPositions.length) * 100;
};

const calculateFloorStretch = (roster) => {
  const avgThreePoint =
    roster.reduce((sum, p) => sum + p.shooting.three_point, 0) / roster.length;
  const avgMidRange =
    roster.reduce((sum, p) => sum + p.shooting.mid_range, 0) / roster.length;
  const avgInsideScore =
    roster.reduce(
      (sum, p) =>
        sum +
        (p.inside_scoring.layup +
          p.inside_scoring.standing_dunk +
          p.inside_scoring.driving_dunk) /
          3,
      0
    ) / roster.length;

  return (
    100 -
    (Math.abs(avgThreePoint - avgMidRange) +
      Math.abs(avgMidRange - avgInsideScore)) /
      2
  );
};

const calculateRebounding = (roster) => {
  const avgOffRebounding =
    roster.reduce((sum, p) => sum + p.defense.offensive_rebound, 0) /
    roster.length;
  const avgDefRebounding =
    roster.reduce((sum, p) => sum + p.defense.defensive_rebound, 0) /
    roster.length;
  return avgOffRebounding * 0.4 + avgDefRebounding * 0.6;
};

const calculateDefense = (roster) => {
  const avgInteriorDef =
    roster.reduce((sum, p) => sum + p.defense.interior, 0) / roster.length;
  const avgPerimeterDef =
    roster.reduce((sum, p) => sum + p.defense.perimeter, 0) / roster.length;
  const avgHelpDefense =
    roster.reduce((sum, p) => sum + p.intangibles.help_defense_iq, 0) /
    roster.length;
  return avgInteriorDef * 0.35 + avgPerimeterDef * 0.35 + avgHelpDefense * 0.3;
};

const calculatePlaymaking = (roster) => {
  const playmakers = roster.filter(
    (p) =>
      (p.playmaking.pass_accuracy +
        p.playmaking.pass_iq +
        p.playmaking.pass_vision) /
        3 >=
      85
  ).length;
  return Math.min(100, (playmakers / (roster.length * 0.3)) * 100);
};

const calculateFreeThrows = (roster) => {
  const weakFTShooters = roster.filter(
    (p) => p.shooting.free_throw < 75
  ).length;
  return 100 - (weakFTShooters / roster.length) * 100;
};

const calculateHustle = (roster) => {
  return (
    roster.reduce((sum, p) => sum + p.athleticism.hustle, 0) / roster.length
  );
};

const calculateShotIQ = (roster) => {
  return roster.reduce((sum, p) => sum + p.shooting.shot_iq, 0) / roster.length;
};

const calculateBadges = (roster) => {
  const avgBadges =
    roster.reduce((sum, p) => sum + p.badges.total, 0) / roster.length;
  return Math.min(100, (avgBadges / 20) * 100);
};

// Get feedback message based on final score
const getFeedbackMessage = (score) => {
  if (score >= 95)
    return "Elite Dynasty Material! This team has the perfect blend of talent, chemistry, and balance - reminiscent of the '96 Bulls! 🏆👑";
  if (score >= 90)
    return "Championship Caliber! Your team has the depth and versatility of the 2022 Warriors - true title contenders! 🏆";
  if (score >= 85)
    return "Title Contender! This roster has excellent balance and could compete with any team in the league! 🌟";
  if (score >= 80)
    return "Playoff Ready! Your team shows great potential with strong fundamentals and good chemistry! 💪";
  if (score >= 75)
    return "Promising Core! With some development, this team could make some serious noise! 📈";
  if (score >= 70)
    return "Solid Foundation! Your team has good pieces but might need more balance to compete at the highest level. 🔄";
  if (score >= 65)
    return "Work in Progress! There's talent here, but the roster needs more cohesion and depth. 🛠️";
  return "Development Mode! Keep drafting - focus on team balance and complementary skillsets! 📚";
};

// Main evaluation function
const evaluateTeam = (roster) => {
  if (!roster || roster.length === 0) return 0;

  // Scoring weights
  const weights = {
    positionBalance: 15,
    floorStretch: 12,
    rebounding: 10,
    defense: 15,
    playmaking: 10,
    freeThrows: 8,
    hustle: 8,
    shotIQ: 8,
    badges: 7,
    heightBalance: 7,
  };

  // Calculate all scores
  const scores = {
    positionBalance: calculatePositionBalance(roster),
    floorStretch: calculateFloorStretch(roster),
    rebounding: calculateRebounding(roster),
    defense: calculateDefense(roster),
    playmaking: calculatePlaymaking(roster),
    freeThrows: calculateFreeThrows(roster),
    hustle: calculateHustle(roster),
    shotIQ: calculateShotIQ(roster),
    badges: calculateBadges(roster),
    heightBalance: calculateHeightScore(roster),
  };

  // Calculate weighted final score
  const finalScore = Object.entries(weights).reduce(
    (total, [category, weight]) => {
      return total + (scores[category] * weight) / 100;
    },
    0
  );

  return Math.round(finalScore);
};

export { evaluateTeam, getFeedbackMessage };
