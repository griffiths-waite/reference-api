import z from 'zod';

const regexRules: Record<string, [RegExp, string]> = {
    seasonId: [/^\d{2}-\d{2}$/, "Value must be in the format YY-YY"],
    seasonDescription: [/^\d{4}-\d{4}$/, "Value must be in the format YYYY-YYYY"],
    onlyCaps: [/^[A-Z]+$/, "Value must be only uppercase letters"],
    capsAndNumbers: [/^[A-Z0-9]+$/, "Value must be only uppercase letters and numbers"],
    upperLowerSpaces: [/^[A-Za-z]+$/, "Value must be only uppercase and lowercase letters, and spaces"],
    upperLowerSpacesApostrophes: [/^[A-Za-z\s']+$/, "Value must be only uppercase and lowercase letters, spaces, and apostrophes"],
    upperLowerHyphen: [/^[A-Za-z-]+$/, "Value must be only uppercase and lowercase letters, and hyphens"],
};

const sequentialSeasonYears = (val: string): boolean => {
    const [first, second] = val.split('-').map(Number);
    return second === first + 1;
};
const sequestialSeasonYearsMessage = "The second number must be exactly 1 more than the first number";

export const schemas = {
    dateStringSchema: z.string().date().transform((val) => new Date(val)),
    dateTimeStringSchema: z.string().datetime().transform((val) => new Date(val)),
    gameIdSchema: z.number().int().positive().brand('GameId'),
    seasonIdSchema: z.string().regex(...regexRules.seasonId).refine(sequentialSeasonYears, {message: sequestialSeasonYearsMessage}).brand('SeasonId'),
    seasonDescriptionsSchema: z.string().regex(...regexRules.seasonDescription).refine(sequentialSeasonYears, {message: sequestialSeasonYearsMessage}).brand('SeasonDescription'),
    leagueIdSchema: z.string().max(5).regex(...regexRules.capsAndNumbers).brand('LeagueId'),
    clubIdSchema: z.string().max(4).regex(...regexRules.onlyCaps).brand('ClubId'),
    homePosessionSchema: z.number().int().min(0).max(100).brand('HomePosession'),
    cornersSchema: z.number().int().min(0).max(999).brand('Corners'),
    shotsSchema: z.number().int().min(0).max(999).brand('Shots'),
    bookingTypeSchema: z.enum(['Y', 'R']).brand('BookingType'),
    minutesSchema: z.number().int().min(0).max(999).brand('Minutes'),
    secondsSchema: z.number().int().min(0).max(59).brand('Seconds'),
    clubNameSchema: z.string().max(30).regex(...regexRules.upperLowerSpaces).brand('ClubName'),
    playerIdSchema: z.number().int().min(0).max(99999).brand('PlayerId'),
    groundNameSchema: z.string().max(50).regex(...regexRules.upperLowerSpacesApostrophes).brand('GroundName'),
    nameSchema: z.string().max(50).regex(...regexRules.upperLowerHyphen),
    positionIdSchema: z.number().int().min(0).max(99).brand('PositionId'),
}

export type GameId = z.infer<typeof schemas.gameIdSchema>;
export type SeasonId = z.infer<typeof schemas.seasonIdSchema>;
export type SeasonDescription = z.infer<typeof schemas.seasonDescriptionsSchema>;
export type LeagueId = z.infer<typeof schemas.leagueIdSchema>;
export type ClubId = z.infer<typeof schemas.clubIdSchema>;
export type HomePosession = z.infer<typeof schemas.homePosessionSchema>;
export type Corners = z.infer<typeof schemas.cornersSchema>;
export type Shots = z.infer<typeof schemas.shotsSchema>;
export type BookingType = z.infer<typeof schemas.bookingTypeSchema>;
export type Minutes = z.infer<typeof schemas.minutesSchema>;
export type Seconds = z.infer<typeof schemas.secondsSchema>;
export type ClubName = z.infer<typeof schemas.clubNameSchema>;
export type GroundName = z.infer<typeof schemas.groundNameSchema>;
export type Name = z.infer<typeof schemas.nameSchema>;
export type PlayerId = z.infer<typeof schemas.playerIdSchema>;
export type PositionId = z.infer<typeof schemas.positionIdSchema>;
