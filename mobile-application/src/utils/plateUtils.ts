// Indian license plate number regex patterns
// HSRP format: AA 00 AA 0000 or AA 00 A 0000 (for older plates)
const INDIAN_PLATE_PATTERN = /^([A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4})$/;

// State codes for Indian plates
const STATE_CODES = [
  'AP', 'AR', 'AS', 'BR', 'CG', 'CH', 'DD', 'DL', 'DK', 'GA', 'GJ', 'HP', 'HR', 'JH',
  'JK', 'KA', 'KL', 'LD', 'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD', 'PY', 'PN', 'RJ',
  'SK', 'TN', 'TR', 'UP', 'WB', 'AN', 'CH', 'DD', 'CH'
];

// Common OCR confusions (Indian plates)
const OCR_CONFUSIONS: Record<string, string> = {
  'O': '0',
  'o': '0',
  'I': '1',
  'i': '1',
  'l': '1',
  'B': '8',
  'b': '8',
  'S': '5',
  's': '5',
  'Z': '2',
  'z': '2',
  'A': '4',
  'a': '4',
};

export const formatPlate = (raw: string): string => {
  // Remove all non-alphanumeric characters
  let cleaned = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  // Apply OCR corrections for common confusions
  cleaned = cleaned.split('').map(char => {
    if (OCR_CONFUSIONS[char]) {
      return OCR_CONFUSIONS[char];
    }
    return char;
  }).join('');

  // Validate against Indian plate pattern
  if (INDIAN_PLATE_PATTERN.test(cleaned)) {
    // Format as AA 00 AA 0000
    return cleaned.substring(0, 2) + ' ' +
           cleaned.substring(2, 4) + ' ' +
           cleaned.substring(4, cleaned.length - 4) + ' ' +
           cleaned.substring(cleaned.length - 4);
  }

  // Try to match partial patterns
  if (cleaned.length >= 8) {
    return cleaned.substring(0, 2) + ' ' +
           cleaned.substring(2, 4) + ' ' +
           cleaned.substring(4, 6) + ' ' +
           cleaned.substring(6, 10);
  }

  return cleaned;
};

export const isValidPlate = (plate: string): boolean => {
  const formatted = formatPlate(plate);
  return INDIAN_PLATE_PATTERN.test(formatted.replace(/\s/g, ''));
};

export const extractPlateFromOCR = (ocrText: string): string => {
  // Clean OCR output - remove spaces, normalize
  const cleaned = ocrText.replace(/\s+/g, '').toUpperCase();

  // Try to find Indian plate pattern in the text
  const match = cleaned.match(/[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}/);

  if (match) {
    return formatPlate(match[0]);
  }

  // If no match, try to format what we have
  const alphaNumeric = cleaned.replace(/[^A-Za-z0-9]/g, '');
  if (alphaNumeric.length >= 8) {
    return formatPlate(alphaNumeric);
  }

  return '';
};

export const isPlateOnHotlist = (plate: string, hotlist: HotlistEntry[]): boolean => {
  const formattedPlate = formatPlate(plate).replace(/\s/g, '');
  return hotlist.some(entry => {
    const hotlistPlate = entry.plateNumber.replace(/\s/g, '');
    return hotlistPlate === formattedPlate;
  });
};

// Temporal voting - accept plate only after consistent reads
interface VoteEntry {
  plate: string;
  timestamp: number;
}

class TemporalVoter {
  private votes: VoteEntry[] = [];
  private readonly voteWindow = 2000; // 2 second window
  private readonly minVotes = 3; // Need 3 consistent readings

  record(plate: string) {
    const now = Date.now();
    this.votes.push({ plate: formatPlate(plate), timestamp: now });

    // Clean old votes
    this.votes = this.votes.filter(v => now - v.timestamp < this.voteWindow);

    // Check if we have enough consistent votes
    const recentVotes = this.votes.filter(v => now - v.timestamp < this.voteWindow / 2);
    const plateCounts: Record<string, number> = {};

    for (const vote of recentVotes) {
      plateCounts[vote.plate] = (plateCounts[vote.plate] || 0) + 1;
    }

    for (const [plate, count] of Object.entries(plateCounts)) {
      if (count >= this.minVotes) {
        return plate;
      }
    }

    return null;
  }

  reset() {
    this.votes = [];
  }

  clear() {
    this.votes = [];
  }
}

export const temporalVoter = new TemporalVoter();
