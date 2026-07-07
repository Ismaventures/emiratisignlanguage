"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var admin, dataset, dataPath, rawData, items, annotationCount, _i, items_1, item, video;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting Saudi Sign Language Dataset Ingestion...');
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@emirsign.ai' },
                            update: {},
                            create: {
                                email: 'admin@emirsign.ai',
                                passwordHash: '$2b$12$LJ3m4ys3Lz0QfQqQQqQqQeQqQqQqQqQqQqQqQqQqQqQqQqQqQq',
                                name: 'Admin',
                                role: 'ADMIN',
                                emailVerified: true,
                            },
                        })];
                case 1:
                    admin = _a.sent();
                    return [4 /*yield*/, prisma.dataset.create({
                            data: {
                                name: 'Saudi Sign Language (Isharah Subset)',
                                description: 'Open-source benchmark subset from Isharah CSLR for testing avatar procedural animations.',
                                language: 'ar-SA',
                                version: 1,
                                status: 'READY',
                                createdBy: admin.id,
                            },
                        })];
                case 2:
                    dataset = _a.sent();
                    console.log("Created Dataset ID: ".concat(dataset.id));
                    dataPath = path_1.default.join(__dirname, '../data/isharah_sample.json');
                    rawData = fs_1.default.readFileSync(dataPath, 'utf-8');
                    items = JSON.parse(rawData);
                    annotationCount = 0;
                    _i = 0, items_1 = items;
                    _a.label = 3;
                case 3:
                    if (!(_i < items_1.length)) return [3 /*break*/, 7];
                    item = items_1[_i];
                    return [4 /*yield*/, prisma.datasetVideo.create({
                            data: {
                                datasetId: dataset.id,
                                storageKey: "datasets/isharah/".concat(item.videoId, ".mp4"),
                                durationMs: item.durationMs,
                                lighting: 'Studio',
                                angle: 'Front',
                            },
                        })];
                case 4:
                    video = _a.sent();
                    // Create the annotation containing the procedural parameters (handshape, movement, etc.)
                    return [4 /*yield*/, prisma.datasetAnnotation.create({
                            data: {
                                videoId: video.id,
                                frameNumber: 0,
                                landmarksJson: JSON.stringify(item.landmarksJson),
                                gestureLabel: item.gestureLabel,
                                sentenceLabel: item.arabicText,
                                annotatedBy: admin.id,
                            },
                        })];
                case 5:
                    // Create the annotation containing the procedural parameters (handshape, movement, etc.)
                    _a.sent();
                    annotationCount++;
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7:
                    console.log("Successfully ingested ".concat(annotationCount, " SSL annotations!"));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })
    .catch(function (e) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.error('Ingestion Failed:', e);
                return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                process.exit(1);
                return [2 /*return*/];
        }
    });
}); });
