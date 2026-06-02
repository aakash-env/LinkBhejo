"use strict";
// ─────────────────────────────────────────
// Enums (mirroring Prisma enums for frontend use)
// ─────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_LIMITS = void 0;
exports.PLAN_LIMITS = {
    FREE: {
        dmsPerMonth: 50,
        maxAccounts: 1,
        aiEnabled: false,
        sequencesEnabled: false,
        abTestingEnabled: false,
        whitelabelEnabled: false,
    },
    PRO: {
        dmsPerMonth: -1,
        maxAccounts: 3,
        aiEnabled: true,
        sequencesEnabled: true,
        abTestingEnabled: true,
        whitelabelEnabled: false,
    },
    AGENCY: {
        dmsPerMonth: -1,
        maxAccounts: -1,
        aiEnabled: true,
        sequencesEnabled: true,
        abTestingEnabled: true,
        whitelabelEnabled: true,
    },
};
//# sourceMappingURL=index.js.map