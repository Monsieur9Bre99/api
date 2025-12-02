/**
 * Convertit une chaîne de caractères représentant un intervalle de temps en un
 * timestamp (nombre de millisecondes). La chaîne de caractères attendue doit
 * être au format "10s", "5m", "2h", "1d".
 *
 * @example
 * convertToTimestamp("10s") // 10 000
 * convertToTimestamp("5m") // 300 000
 * convertToTimestamp("2h") // 7 200 000
 * convertToTimestamp("1d") // 86 400 000
 *
 * @throws {Error} Si le paramètre "time" n'est pas une chaîne non vide.
 * @throws {Error} Si le format de la chaîne de caractères est invalide.
 * @throws {Error} Si l'unité de temps n'est pas reconnue.
 *
 * @param {string} time - La chaîne de caractères représentant l'intervalle de temps.
 * @returns {number} Le timestamp correspondant à l'intervalle de temps.
 */
export const convertToTimestamp = (time: string): number => {
  if (!time || typeof time !== 'string') {
    throw new Error('Le paramètre "time" doit être une chaîne non vide.');
  }

  const parts = time.split(/(?=[a-zA-Z])/);

  const unit = parts[1].toLowerCase();
  const value = parseInt(parts[0], 10);

  if (isNaN(value) || !unit) {
    throw new Error(
      `Format invalide : "${time}" (exemples valides : "10s", "5m", "2h", "1d")`,
    );
  }

  switch (unit) {
    case 's':
    case 'sec':
    case 'secs':
    case 'second':
    case 'seconds':
      return value * 1000; // secondes → ms

    case 'm':
    case 'min':
    case 'mins':
    case 'minute':
    case 'minutes':
      return value * 60 * 1000; // minutes → ms

    case 'h':
    case 'hr':
    case 'hrs':
    case 'hour':
    case 'hours':
      return value * 60 * 60 * 1000; // heures → ms

    case 'd':
    case 'day':
    case 'days':
      return value * 24 * 60 * 60 * 1000; // jours → ms

    default:
      throw new Error(`Unité de temps non reconnue : ${unit}`);
  }
};

/**
 * Retourne une date à partir d'un timestamp.
 * Le timestamp représente l'intervalle de temps en millisecondes à ajouter à la date actuelle.
 *
 * @throws {Error} Si le timestamp n'est pas un nombre valide.
 *
 * @param {number} timestamp - Le timestamp (en ms) à ajouter à la date actuelle.
 * @returns {Date} La date correspondant au timestamp.
 */
export const calcDateFromNow = (timestamp: number): Date => {
  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    throw new Error('Le timestamp doit être un nombre valide.');
  }
  return new Date(Date.now() + timestamp);
};
