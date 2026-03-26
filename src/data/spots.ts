import type { SpotMeta } from "@/lib/types";

export const SPOTS: SpotMeta[] = [
  {
    name: "Higgins Beach",
    location: "Scarborough",
    driveTime: "~35 min",
    driveMinutes: 35,
    faces: "SE",
    bestSwellDirDeg: 157,  // SSE
    bestWindDirRange: [292, 337], // NW-W
    bestTide: "Mid rising",
    minRideableFt: 2,
  },
  {
    name: "Scarborough Beach",
    location: "Scarborough",
    driveTime: "~30 min",
    driveMinutes: 30,
    faces: "E-SE",
    bestSwellDirDeg: 112,  // ESE
    bestWindDirRange: [247, 337], // W-NW
    bestTide: "Mid",
    minRideableFt: 2,
  },
  {
    name: "Fortunes Rocks",
    location: "Biddeford",
    driveTime: "~15 min",
    driveMinutes: 15,
    faces: "SE",
    bestSwellDirDeg: 157,  // SSE
    bestWindDirRange: [292, 337], // NW-W
    bestTide: "Mid-high",
    minRideableFt: 2,
  },
  {
    name: "Long Sands",
    location: "York",
    driveTime: "~20 min",
    driveMinutes: 20,
    faces: "SE",
    bestSwellDirDeg: 157,  // SSE
    bestWindDirRange: [292, 337], // NW-W
    bestTide: "Mid",
    minRideableFt: 2,
  },
  {
    name: "Gooch's Beach",
    location: "Kennebunk",
    driveTime: "Home break",
    driveMinutes: 0,
    faces: "S-SE",
    bestSwellDirDeg: 180,  // S
    bestWindDirRange: [337, 22], // N-NW
    bestTide: "Mid",
    minRideableFt: 3,
  },
];
