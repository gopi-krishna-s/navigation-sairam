/**
 * IEEE Day 2026 - Pradyut Parva 3
 * Campus Navigation Graph & Dijkstra Routing Engine
 * 
 * Based on the Official College Architectural Blueprint:
 * - Main Entrance 1: Front view / Western road entrance
 * - Entrance 2: Northern entrance (near EEE Labs & Seminar Hall)
 * - Entrance 3: Southern entrance (near AV Hall 118, Cafe & Physics Lab)
 * - Central Elevator (LIFT): Located in the South-West vertical core
 * - 4 Staircases: North-West, North-East, South-West, South-East
 */

const buildingGraph = {
  nodes: {
    // ==========================================
    // GROUND FLOOR (Floor 0) - Calibrated to 1754 x 1241 Blueprint
    // ==========================================
    // Entrances
    "entrance1": { id: "entrance1", name: "Main Entrance 1 (Front View / West Road)", floor: 0, x: 550, y: 576, type: "entrance" },
    "entrance2": { id: "entrance2", name: "Entrance 2 (North Gate)", floor: 0, x: 918, y: 150, type: "entrance" },
    "entrance3": { id: "entrance3", name: "Entrance 3 (South Gate)", floor: 0, x: 922, y: 989, type: "entrance" },
    "inside": { id: "inside", name: "Already Inside (Central Elevator & Foyer)", floor: 0, x: 866, y: 756, type: "entrance" },

    // Ground Pathways & Corridors
    "f0_ent1_corridor": { id: "f0_ent1_corridor", name: "West Main Entry Corridor", floor: 0, x: 700, y: 576, type: "junction" },
    "f0_junc_west_mid": { id: "f0_junc_west_mid", name: "West Mid Pathway", floor: 0, x: 735, y: 576, type: "junction" },
    "f0_junc_west_north": { id: "f0_junc_west_north", name: "North-West Pathway", floor: 0, x: 735, y: 317, type: "junction" },
    "f0_junc_north_mid": { id: "f0_junc_north_mid", name: "North Central Pathway", floor: 0, x: 918, y: 317, type: "junction" },
    "f0_central_north_loop": { id: "f0_central_north_loop", name: "Central Pathway between EEE Labs", floor: 0, x: 918, y: 353, type: "junction" },
    "f0_junc_north_east": { id: "f0_junc_north_east", name: "North-East Pathway", floor: 0, x: 1099, y: 317, type: "junction" },
    "f0_junc_east_mid": { id: "f0_junc_east_mid", name: "East Mid Pathway", floor: 0, x: 1099, y: 612, type: "junction" },
    "f0_seminar_door": { id: "f0_seminar_door", name: "Seminar Hall Entry", floor: 0, x: 1000, y: 612, type: "junction" },
    "f0_central_mid_path": { id: "f0_central_mid_path", name: "Central Pathway (Seminar to AV Hall)", floor: 0, x: 918, y: 734, type: "junction" },
    "f0_junc_east_south": { id: "f0_junc_east_south", name: "South-East Pathway", floor: 0, x: 1099, y: 874, type: "junction" },
    "f0_av_hall_door": { id: "f0_av_hall_door", name: "AV Hall Entry", floor: 0, x: 1018, y: 874, type: "junction" },
    "f0_junc_south_mid": { id: "f0_junc_south_mid", name: "South Central Pathway", floor: 0, x: 922, y: 874, type: "junction" },
    "f0_junc_south_west": { id: "f0_junc_south_west", name: "South-West Pathway", floor: 0, x: 735, y: 874, type: "junction" },
    "f0_ise_lab_door": { id: "f0_ise_lab_door", name: "ISE Lab Entry", floor: 0, x: 735, y: 828, type: "junction" },
    "f0_annex_turn": { id: "f0_annex_turn", name: "Annex Lab Pathway Turn", floor: 0, x: 783, y: 874, type: "junction" },
    "f0_annex_corridor": { id: "f0_annex_corridor", name: "Annex Labs Corridor", floor: 0, x: 783, y: 980, type: "junction" },

    // Vertical Transit (Ground)
    "lift_ground": { id: "lift_ground", name: "Central Elevator (Ground)", floor: 0, x: 866, y: 756, type: "lift" },
    "stairs_sw_ground": { id: "stairs_sw_ground", name: "South-West Stairs (Ground)", floor: 0, x: 826, y: 749, type: "stairs" },
    "stairs_se_ground": { id: "stairs_se_ground", name: "South-East Stairs (Ground)", floor: 0, x: 1063, y: 749, type: "stairs" },
    "stairs_nw_ground": { id: "stairs_nw_ground", name: "North-West Stairs (Ground)", floor: 0, x: 834, y: 368, type: "stairs" },
    "stairs_ne_ground": { id: "stairs_ne_ground", name: "North-East Stairs (Ground)", floor: 0, x: 1056, y: 368, type: "stairs" },

    // Ground Floor Rooms & Annex
    "room_124": { id: "room_124", name: "Seminar Hall (Room 124)", floor: 0, x: 1044, y: 613, type: "room" },
    "room_118": { id: "room_118", name: "AV Hall (Room 118)", floor: 0, x: 1018, y: 877, type: "room" },
    "room_119": { id: "room_119", name: "ISE Lab (Room 119)", floor: 0, x: 735, y: 828, type: "room" },
    "room_eyantra": { id: "room_eyantra", name: "E Yantra Lab", floor: 0, x: 783, y: 1021, type: "room" },
    "physics_lab": { id: "physics_lab", name: "Physics Lab", floor: 0, x: 660, y: 1115, type: "facility" },
    "cafe_ground": { id: "cafe_ground", name: "Campus Cafeteria", floor: 0, x: 590, y: 1115, type: "facility" },
    "chem_lab": { id: "chem_lab", name: "Chem Lab", floor: 0, x: 785, y: 1130, type: "facility" },

    // ==========================================
    // FIRST FLOOR (Floor 1) - Calibrated to 1754 x 1241 Blueprint
    // ==========================================
    "f1_ent_corridor": { id: "f1_ent_corridor", name: "1st Floor West Approach", floor: 1, x: 562, y: 574, type: "junction" },
    "f1_junc_west_mid": { id: "f1_junc_west_mid", name: "1st Floor West Pathway", floor: 1, x: 623, y: 574, type: "junction" },
    "f1_junc_west_north": { id: "f1_junc_west_north", name: "1st Floor North-West Pathway", floor: 1, x: 623, y: 256, type: "junction" },
    "f1_room_203_door": { id: "f1_room_203_door", name: "Room 203 Entry", floor: 1, x: 621, y: 200, type: "junction" },
    "f1_junc_north_mid": { id: "f1_junc_north_mid", name: "1st Floor North Central Pathway", floor: 1, x: 906, y: 256, type: "junction" },
    "f1_central_north_loop": { id: "f1_central_north_loop", name: "1st Floor Central Pathway between CSE Labs", floor: 1, x: 906, y: 320, type: "junction" },
    "f1_junc_north_east": { id: "f1_junc_north_east", name: "1st Floor North-East Pathway", floor: 1, x: 1143, y: 256, type: "junction" },
    "f1_room_208_door": { id: "f1_room_208_door", name: "Room 208 Entry", floor: 1, x: 1143, y: 200, type: "junction" },
    "f1_junc_east_north": { id: "f1_junc_east_north", name: "1st Floor East Upper Pathway", floor: 1, x: 1191, y: 256, type: "junction" },
    "f1_junc_east_mid1": { id: "f1_junc_east_mid1", name: "1st Floor East Mid Pathway 1", floor: 1, x: 1191, y: 691, type: "junction" },
    "f1_junc_east_mid2": { id: "f1_junc_east_mid2", name: "1st Floor East Mid Pathway 2", floor: 1, x: 1191, y: 854, type: "junction" },
    "f1_junc_east_south": { id: "f1_junc_east_south", name: "1st Floor South-East Pathway", floor: 1, x: 1191, y: 900, type: "junction" },
    "f1_junc_south_mid": { id: "f1_junc_south_mid", name: "1st Floor South Central Pathway", floor: 1, x: 906, y: 900, type: "junction" },
    "f1_junc_south_west": { id: "f1_junc_south_west", name: "1st Floor South-West Pathway", floor: 1, x: 623, y: 900, type: "junction" },

    // Vertical Transit (First)
    "lift_first": { id: "lift_first", name: "Central Elevator (1st Floor)", floor: 1, x: 730, y: 786, type: "lift" },
    "stairs_sw_first": { id: "stairs_sw_first", name: "South-West Stairs (1st Floor)", floor: 1, x: 678, y: 786, type: "stairs" },
    "stairs_se_first": { id: "stairs_se_first", name: "South-East Stairs (1st Floor)", floor: 1, x: 1130, y: 786, type: "stairs" },
    "stairs_nw_first": { id: "stairs_nw_first", name: "North-West Stairs (1st Floor)", floor: 1, x: 668, y: 350, type: "stairs" },
    "stairs_ne_first": { id: "stairs_ne_first", name: "North-East Stairs (1st Floor)", floor: 1, x: 1145, y: 350, type: "stairs" },

    // First Floor Rooms
    "room_203": { id: "room_203", name: "Room 203 (Technical Debate)", floor: 1, x: 621, y: 173, type: "room" },
    "room_208": { id: "room_208", name: "Room 208 (AI vs Human)", floor: 1, x: 1143, y: 173, type: "room" },
    "room_library": { id: "room_library", name: "Central Library", floor: 1, x: 906, y: 617, type: "facility" },
    "room_213": { id: "room_213", name: "Room 213 (Technical Quiz)", floor: 1, x: 1230, y: 691, type: "room" },
    "room_214": { id: "room_214", name: "Room 214 (Connections)", floor: 1, x: 1230, y: 854, type: "room" },

    // ==========================================
    // SECOND FLOOR (Floor 2) - Calibrated to 1754 x 1241 Blueprint
    // ==========================================
    "f2_ent_corridor": { id: "f2_ent_corridor", name: "2nd Floor West Approach", floor: 2, x: 531, y: 640, type: "junction" },
    "f2_junc_west_mid": { id: "f2_junc_west_mid", name: "2nd Floor West Pathway", floor: 2, x: 588, y: 640, type: "junction" },
    "f2_junc_west_north": { id: "f2_junc_west_north", name: "2nd Floor North-West Pathway", floor: 2, x: 588, y: 235, type: "junction" },
    "f2_junc_north_mid": { id: "f2_junc_north_mid", name: "2nd Floor North Central Pathway", floor: 2, x: 900, y: 235, type: "junction" },
    "f2_junc_north_east": { id: "f2_junc_north_east", name: "2nd Floor North-East Pathway", floor: 2, x: 1112, y: 235, type: "junction" },
    "f2_room_303_corr": { id: "f2_room_303_corr", name: "Room 303 Corridor", floor: 2, x: 1164, y: 235, type: "junction" },
    "f2_junc_east_305": { id: "f2_junc_east_305", name: "2nd Floor East Corridor (305)", floor: 2, x: 1112, y: 272, type: "junction" },
    "f2_junc_east_306": { id: "f2_junc_east_306", name: "2nd Floor East Corridor (306)", floor: 2, x: 1112, y: 446, type: "junction" },
    "f2_junc_mid_west": { id: "f2_junc_mid_west", name: "2nd Floor Middle Cross Pathway (West)", floor: 2, x: 588, y: 504, type: "junction" },
    "f2_junc_mid_center": { id: "f2_junc_mid_center", name: "2nd Floor Middle Central Pathway", floor: 2, x: 826, y: 504, type: "junction" },
    "f2_junc_mid_east": { id: "f2_junc_mid_east", name: "2nd Floor Middle Cross Pathway (East)", floor: 2, x: 1112, y: 504, type: "junction" },
    "f2_junc_room_325": { id: "f2_junc_room_325", name: "Room 325 Corridor (ICE Dept)", floor: 2, x: 1038, y: 575, type: "junction" },
    "f2_junc_east_307": { id: "f2_junc_east_307", name: "2nd Floor East Corridor (307)", floor: 2, x: 1112, y: 572, type: "junction" },
    "f2_junc_east_308": { id: "f2_junc_east_308", name: "2nd Floor East Corridor (308)", floor: 2, x: 1112, y: 670, type: "junction" },
    "f2_junc_south_curved": { id: "f2_junc_south_curved", name: "2nd Floor South Curved Pathway", floor: 2, x: 826, y: 997, type: "junction" },
    "f2_junc_east_south": { id: "f2_junc_east_south", name: "2nd Floor South-East Pathway", floor: 2, x: 1112, y: 1067, type: "junction" },
    "f2_junc_south_mid": { id: "f2_junc_south_mid", name: "2nd Floor South Central Pathway", floor: 2, x: 900, y: 1067, type: "junction" },
    "f2_junc_south_west": { id: "f2_junc_south_west", name: "2nd Floor South-West Pathway", floor: 2, x: 588, y: 1067, type: "junction" },

    // Vertical Transit (Second)
    "lift_second": { id: "lift_second", name: "Central Elevator (2nd Floor)", floor: 2, x: 740, y: 982, type: "lift" },
    "stairs_sw_second": { id: "stairs_sw_second", name: "South-West Stairs (2nd Floor)", floor: 2, x: 678, y: 1005, type: "stairs" },
    "stairs_se_second": { id: "stairs_se_second", name: "South-East Stairs (2nd Floor)", floor: 2, x: 1001, y: 1005, type: "stairs" },
    "stairs_nw_second": { id: "stairs_nw_second", name: "North-West Stairs (2nd Floor)", floor: 2, x: 645, y: 298, type: "stairs" },
    "stairs_ne_second": { id: "stairs_ne_second", name: "North-East Stairs (2nd Floor)", floor: 2, x: 1034, y: 298, type: "stairs" },

    // Second Floor Rooms
    "room_303": { id: "room_303", name: "Room 303 (Antenna Hackathon)", floor: 2, x: 1181, y: 166, type: "room" },
    "room_305": { id: "room_305", name: "Room 305 (Photography)", floor: 2, x: 1181, y: 272, type: "room" },
    "room_306": { id: "room_306", name: "Room 306 (Prompt War)", floor: 2, x: 1181, y: 446, type: "room" },
    "room_307": { id: "room_307", name: "Room 307 (Gaming Arena)", floor: 2, x: 1181, y: 572, type: "room" },
    "room_308": { id: "room_308", name: "Room 308 (Circuit Debugging)", floor: 2, x: 1181, y: 670, type: "room" },
    "room_325": { id: "room_325", name: "Room 325 (Code Debugging)", floor: 2, x: 1038, y: 600, type: "room" },
    "room_ece_dept": { id: "room_ece_dept", name: "ECE Department", floor: 2, x: 817, y: 920, type: "facility" }
  },

  edges: [
    // ------------------------------------------
    // GROUND FLOOR PATHWAYS
    // ------------------------------------------
    // Entrance 1
    { from: "entrance1", to: "f0_ent1_corridor", weight: 15, type: "corridor", text: "Enter through Main Entrance 1 (Front View)" },
    { from: "f0_ent1_corridor", to: "f0_junc_west_mid", weight: 8, type: "corridor", text: "Walk into the central west corridor" },
    { from: "f0_junc_west_mid", to: "f0_junc_west_north", weight: 26, type: "corridor", text: "Head north along west pathway" },
    { from: "f0_junc_west_north", to: "f0_junc_north_mid", weight: 18, type: "corridor", text: "Turn right onto the north corridor" },
    
    // Entrance 2 & Central Pathway
    { from: "entrance2", to: "f0_junc_north_mid", weight: 16, type: "corridor", text: "Enter through Entrance 2 (North Gate)" },
    { from: "f0_junc_north_mid", to: "f0_central_north_loop", weight: 5, type: "corridor", text: "Walk south through central pathway between EEE Labs" },
    { from: "f0_central_north_loop", to: "f0_seminar_door", weight: 24, type: "corridor", text: "Head south along central pathway to Seminar Hall 124" },
    { from: "f0_junc_north_mid", to: "f0_junc_north_east", weight: 18, type: "corridor", text: "Continue east along north corridor" },
    
    // East Wing & Seminar Hall 124
    { from: "f0_junc_north_east", to: "f0_junc_east_mid", weight: 28, type: "corridor", text: "Follow east corridor south" },
    { from: "f0_junc_east_mid", to: "f0_seminar_door", weight: 10, type: "corridor", text: "Turn towards Seminar Hall" },
    { from: "f0_seminar_door", to: "room_124", weight: 5, type: "corridor", text: "Enter Seminar Hall 124 (24 Hrs Hackathon)" },
    { from: "f0_seminar_door", to: "f0_central_mid_path", weight: 12, type: "corridor", text: "Walk through central pathway between Seminar Hall & AV Hall" },
    
    // Central Mid Pathway & AV Hall 118 & Entrance 3
    { from: "f0_central_mid_path", to: "lift_ground", weight: 6, type: "corridor", text: "Reach Central Elevator" },
    { from: "f0_central_mid_path", to: "f0_av_hall_door", weight: 12, type: "corridor", text: "Turn into AV Hall entrance" },
    { from: "f0_central_mid_path", to: "f0_junc_south_mid", weight: 14, type: "corridor", text: "Proceed south towards Entrance 3" },
    { from: "f0_central_mid_path", to: "f0_junc_east_south", weight: 18, type: "corridor", text: "Connect towards South-East stairs" },
    { from: "f0_junc_east_mid", to: "f0_junc_east_south", weight: 26, type: "corridor", text: "Walk south along east corridor" },
    { from: "f0_junc_east_south", to: "f0_av_hall_door", weight: 8, type: "corridor", text: "Turn into AV Hall entrance" },
    { from: "f0_av_hall_door", to: "room_118", weight: 5, type: "corridor", text: "Enter AV Hall 118 (Treasure Hunt)" },
    { from: "f0_junc_east_south", to: "f0_junc_south_mid", weight: 18, type: "corridor", text: "Turn west onto south corridor" },
    { from: "entrance3", to: "f0_junc_south_mid", weight: 12, type: "corridor", text: "Enter through Entrance 3 (South Gate)" },
    
    // Annex & E Yantra Lab
    { from: "f0_junc_south_mid", to: "f0_annex_turn", weight: 14, type: "corridor", text: "Head towards the Annex corridor" },
    { from: "f0_annex_turn", to: "f0_annex_corridor", weight: 11, type: "corridor", text: "Walk south into Science & Robotics Annex" },
    { from: "f0_annex_corridor", to: "room_eyantra", weight: 5, type: "corridor", text: "Arrive at E Yantra Lab (Robo Race)" },
    { from: "f0_annex_corridor", to: "physics_lab", weight: 14, type: "corridor", text: "Reach Physics Lab" },
    { from: "f0_annex_corridor", to: "cafe_ground", weight: 20, type: "corridor", text: "Reach Campus Cafeteria" },
    { from: "f0_annex_corridor", to: "chem_lab", weight: 15, type: "corridor", text: "Reach Chem Lab" },

    // South-West & ISE Lab 119
    { from: "f0_annex_turn", to: "f0_junc_south_west", weight: 8, type: "corridor", text: "Proceed along south corridor" },
    { from: "f0_junc_south_west", to: "f0_ise_lab_door", weight: 5, type: "corridor", text: "Turn towards ISE Lab" },
    { from: "f0_ise_lab_door", to: "room_119", weight: 4, type: "corridor", text: "Enter Room 119 (ISE Lab - Webathon)" },
    { from: "f0_junc_south_west", to: "f0_junc_west_mid", weight: 30, type: "corridor", text: "Walk north along west corridor" },

    // Ground Floor Transit links
    { from: "f0_junc_south_west", to: "lift_ground", weight: 12, type: "corridor", text: "Reach Central Elevator" },
    { from: "f0_junc_south_mid", to: "lift_ground", weight: 12, type: "corridor", text: "Reach Central Elevator" },
    { from: "inside", to: "lift_ground", weight: 2, type: "corridor", text: "At Central Elevator" },
    { from: "inside", to: "f0_junc_south_west", weight: 12, type: "corridor", text: "Walk to south-west corridor" },
    { from: "f0_junc_south_west", to: "stairs_sw_ground", weight: 10, type: "corridor", text: "Reach South-West Stairs" },
    { from: "f0_junc_east_south", to: "stairs_se_ground", weight: 12, type: "corridor", text: "Reach South-East Stairs" },
    { from: "f0_junc_west_north", to: "stairs_nw_ground", weight: 12, type: "corridor", text: "Reach North-West Stairs" },
    { from: "f0_junc_north_east", to: "stairs_ne_ground", weight: 12, type: "corridor", text: "Reach North-East Stairs" },

    // ------------------------------------------
    // FIRST FLOOR PATHWAYS
    // ------------------------------------------
    { from: "f1_ent_corridor", to: "f1_junc_west_mid", weight: 8, type: "corridor", text: "West front approach corridor" },
    { from: "f1_junc_west_mid", to: "f1_junc_west_north", weight: 32, type: "corridor", text: "Walk north along west corridor" },
    { from: "f1_junc_west_north", to: "f1_room_203_door", weight: 6, type: "corridor", text: "Turn towards Room 203" },
    { from: "f1_room_203_door", to: "room_203", weight: 3, type: "corridor", text: "Enter Room 203 (Technical Debate)" },
    { from: "f1_junc_west_north", to: "f1_junc_north_mid", weight: 28, type: "corridor", text: "Walk along north corridor" },
    { from: "f1_junc_north_mid", to: "f1_central_north_loop", weight: 7, type: "corridor", text: "Walk south through central pathway between CSE Labs" },
    { from: "f1_central_north_loop", to: "room_library", weight: 18, type: "corridor", text: "Enter Central Library via north approach" },
    { from: "f1_junc_north_mid", to: "f1_junc_north_east", weight: 24, type: "corridor", text: "Continue towards North-East corridor" },
    { from: "f1_junc_north_east", to: "f1_room_208_door", weight: 6, type: "corridor", text: "Turn towards Room 208" },
    { from: "f1_room_208_door", to: "room_208", weight: 3, type: "corridor", text: "Enter Room 208 (AI vs Human)" },
    { from: "f1_junc_north_east", to: "f1_junc_east_north", weight: 6, type: "corridor", text: "Reach east corridor head" },
    { from: "f1_junc_east_north", to: "f1_junc_east_mid1", weight: 43, type: "corridor", text: "Walk south down east corridor" },
    { from: "f1_junc_east_mid1", to: "room_213", weight: 4, type: "corridor", text: "Enter Room 213 (Technical Quiz)" },
    { from: "f1_junc_east_mid1", to: "f1_junc_east_mid2", weight: 16, type: "corridor", text: "Continue south along east corridor" },
    { from: "f1_junc_east_mid2", to: "room_214", weight: 4, type: "corridor", text: "Enter Room 214 (Connections)" },
    { from: "f1_junc_east_mid2", to: "f1_junc_east_south", weight: 8, type: "corridor", text: "Continue south towards stairs" },
    { from: "f1_junc_east_south", to: "f1_junc_south_mid", weight: 28, type: "corridor", text: "Walk west along south corridor" },
    { from: "f1_junc_south_mid", to: "f1_junc_south_west", weight: 28, type: "corridor", text: "Continue west towards elevator lobby" },
    { from: "f1_junc_south_west", to: "f1_junc_west_mid", weight: 32, type: "corridor", text: "Connect north along west pathway" },
    { from: "f1_junc_north_mid", to: "room_library", weight: 20, type: "corridor", text: "Enter Central Library" },
    { from: "f1_junc_south_mid", to: "room_library", weight: 20, type: "corridor", text: "Enter Central Library" },

    // First Floor Transit links
    { from: "f1_junc_south_west", to: "lift_first", weight: 12, type: "corridor", text: "Reach Central Elevator" },
    { from: "f1_junc_south_west", to: "stairs_sw_first", weight: 12, type: "corridor", text: "Reach South-West Stairs" },
    { from: "f1_junc_east_south", to: "stairs_se_first", weight: 12, type: "corridor", text: "Reach South-East Stairs" },
    { from: "f1_junc_west_north", to: "stairs_nw_first", weight: 12, type: "corridor", text: "Reach North-West Stairs" },
    { from: "f1_junc_north_east", to: "stairs_ne_first", weight: 12, type: "corridor", text: "Reach North-East Stairs" },

    // ------------------------------------------
    // SECOND FLOOR PATHWAYS
    // ------------------------------------------
    { from: "f2_ent_corridor", to: "f2_junc_west_mid", weight: 8, type: "corridor", text: "West front corridor" },
    { from: "f2_junc_west_mid", to: "f2_junc_mid_west", weight: 14, type: "corridor", text: "Walk north along west corridor" },
    { from: "f2_junc_mid_west", to: "f2_junc_west_north", weight: 26, type: "corridor", text: "Continue north along west corridor" },
    { from: "f2_junc_west_north", to: "f2_junc_north_mid", weight: 31, type: "corridor", text: "Walk along north corridor" },
    { from: "f2_junc_north_mid", to: "f2_junc_north_east", weight: 21, type: "corridor", text: "Proceed to North-East corridor" },
    { from: "f2_junc_north_east", to: "f2_room_303_corr", weight: 6, type: "corridor", text: "Approach Room 303" },
    { from: "f2_room_303_corr", to: "room_303", weight: 6, type: "corridor", text: "Enter Room 303 (ECE IoT Lab - Antenna Hackathon)" },
    { from: "f2_junc_north_east", to: "f2_junc_east_305", weight: 6, type: "corridor", text: "Head south along east classroom corridor" },
    { from: "f2_junc_east_305", to: "room_305", weight: 7, type: "corridor", text: "Enter Room 305 (Photography)" },
    { from: "f2_junc_east_305", to: "f2_junc_east_306", weight: 17, type: "corridor", text: "Continue south along corridor" },
    { from: "f2_junc_east_306", to: "room_306", weight: 7, type: "corridor", text: "Enter Room 306 (Prompt War)" },
    { from: "f2_junc_east_306", to: "f2_junc_mid_east", weight: 6, type: "corridor", text: "Reach middle cross corridor junction" },
    { from: "f2_junc_mid_east", to: "f2_junc_east_307", weight: 7, type: "corridor", text: "Continue south along corridor" },
    { from: "f2_junc_east_307", to: "room_307", weight: 7, type: "corridor", text: "Enter Room 307 (Gaming Arena)" },
    { from: "f2_junc_east_307", to: "f2_junc_east_308", weight: 10, type: "corridor", text: "Continue south along corridor" },
    { from: "f2_junc_east_308", to: "room_308", weight: 7, type: "corridor", text: "Enter Room 308 (Circuit Debugging)" },
    { from: "f2_junc_east_308", to: "f2_junc_east_south", weight: 39, type: "corridor", text: "Walk south towards ECE Department" },
    { from: "f2_junc_east_south", to: "room_ece_dept", weight: 15, type: "corridor", text: "Enter ECE Department" },
    
    // Middle Horizontal Cross Corridor on Floor 2 (Newly Edited)
    { from: "f2_junc_mid_west", to: "f2_junc_mid_center", weight: 24, type: "corridor", text: "Walk east across middle hallway" },
    { from: "f2_junc_mid_center", to: "f2_junc_mid_east", weight: 28, type: "corridor", text: "Continue east across middle hallway" },
    { from: "f2_junc_mid_center", to: "f2_junc_room_325", weight: 14, type: "corridor", text: "Turn south towards Room 325" },
    { from: "f2_junc_mid_east", to: "f2_junc_room_325", weight: 9, type: "corridor", text: "Turn west towards Room 325" },
    { from: "f2_junc_room_325", to: "room_325", weight: 4, type: "corridor", text: "Enter Room 325 (Code Debugging)" },

    // South corridor & curved pathway on Floor 2 (Newly Edited)
    { from: "f2_junc_east_south", to: "f2_junc_south_mid", weight: 21, type: "corridor", text: "Walk west along south corridor" },
    { from: "f2_junc_south_mid", to: "f2_junc_south_west", weight: 31, type: "corridor", text: "Continue west towards elevator" },
    { from: "f2_junc_south_west", to: "f2_junc_west_mid", weight: 42, type: "corridor", text: "Walk north along west corridor" },
    { from: "lift_second", to: "f2_junc_south_curved", weight: 9, type: "corridor", text: "Walk along south curved pathway" },
    { from: "stairs_sw_second", to: "f2_junc_south_curved", weight: 15, type: "corridor", text: "Walk along south curved pathway" },
    { from: "f2_junc_south_curved", to: "stairs_se_second", weight: 17, type: "corridor", text: "Connect to South-East stairs" },
    { from: "f2_junc_south_curved", to: "f2_junc_south_mid", weight: 10, type: "corridor", text: "Connect to south corridor" },

    // Second Floor Transit links
    { from: "f2_junc_south_west", to: "lift_second", weight: 14, type: "corridor", text: "Reach Central Elevator" },
    { from: "f2_junc_south_west", to: "stairs_sw_second", weight: 12, type: "corridor", text: "Reach South-West Stairs" },
    { from: "f2_junc_east_south", to: "stairs_se_second", weight: 12, type: "corridor", text: "Reach South-East Stairs" },
    { from: "f2_junc_west_north", to: "stairs_nw_second", weight: 12, type: "corridor", text: "Reach North-West Stairs" },
    { from: "f2_junc_north_east", to: "stairs_ne_second", weight: 12, type: "corridor", text: "Reach North-East Stairs" },

    // ------------------------------------------
    // VERTICAL TRANSIT: ELEVATOR & STAIRWELLS
    // ------------------------------------------
    // Central Elevator
    { from: "lift_ground", to: "lift_first", weight: 12, type: "lift", text: "Take Central Elevator to 1st Floor" },
    { from: "lift_first", to: "lift_second", weight: 12, type: "lift", text: "Take Central Elevator to 2nd Floor" },
    { from: "lift_ground", to: "lift_second", weight: 20, type: "lift", text: "Take Central Elevator to 2nd Floor" },

    // South-West Staircase
    { from: "stairs_sw_ground", to: "stairs_sw_first", weight: 15, type: "stairs", text: "Take South-West Stairs up to 1st Floor" },
    { from: "stairs_sw_first", to: "stairs_sw_second", weight: 15, type: "stairs", text: "Take South-West Stairs up to 2nd Floor" },

    // North-West Staircase
    { from: "stairs_nw_ground", to: "stairs_nw_first", weight: 15, type: "stairs", text: "Take North-West Stairs up to 1st Floor" },
    { from: "stairs_nw_first", to: "stairs_nw_second", weight: 15, type: "stairs", text: "Take North-West Stairs up to 2nd Floor" },

    // North-East Staircase
    { from: "stairs_ne_ground", to: "stairs_ne_first", weight: 15, type: "stairs", text: "Take North-East Stairs up to 1st Floor" },
    { from: "stairs_ne_first", to: "stairs_ne_second", weight: 15, type: "stairs", text: "Take North-East Stairs up to 2nd Floor" },

    // South-East Staircase
    { from: "stairs_se_ground", to: "stairs_se_first", weight: 15, type: "stairs", text: "Take South-East Stairs up to 1st Floor" },
    { from: "stairs_se_first", to: "stairs_se_second", weight: 15, type: "stairs", text: "Take South-East Stairs up to 2nd Floor" }
  ]
};

// Map room identifiers to graph nodes
const roomToNodeMap = {
  "124": "room_124",
  "118": "room_118",
  "119": "room_119",
  "E-Yantra": "room_eyantra",
  "203": "room_203",
  "208": "room_208",
  "213": "room_213",
  "214": "room_214",
  "303": "room_303",
  "305": "room_305",
  "306": "room_306",
  "307": "room_307",
  "308": "room_308",
  "325": "room_325"
};

/**
 * Dijkstra Shortest Path Engine
 */
function findShortestPath(startNodeId, targetRoomId, options = {}) {
  const avoidStairs = !!options.avoidStairs;
  const ignoreCustom = !!options.ignoreCustom;
  const targetNodeId = roomToNodeMap[targetRoomId] || targetRoomId;

  if (!buildingGraph.nodes[startNodeId]) {
    startNodeId = "entrance1";
  }

  if (!buildingGraph.nodes[targetNodeId]) {
    return null;
  }

  // 1. Check for custom visually-mapped route in localStorage (unless explicitly ignored)
  if (!ignoreCustom && typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem("ieee_custom_routes");
      if (raw) {
        const allRoutes = JSON.parse(raw);
        const customKey = `${startNodeId}_${targetRoomId}`;
        const custom = allRoutes[customKey];
        if (custom && custom.waypointsByFloor) {
          const floorPaths = {
            0: (custom.waypointsByFloor[0] || []).map(p => ({ x: Number(p.x), y: Number(p.y), floor: 0 })),
            1: (custom.waypointsByFloor[1] || []).map(p => ({ x: Number(p.x), y: Number(p.y), floor: 1 })),
            2: (custom.waypointsByFloor[2] || []).map(p => ({ x: Number(p.x), y: Number(p.y), floor: 2 }))
          };
          const totalPointsCount = floorPaths[0].length + floorPaths[1].length + floorPaths[2].length;
          if (totalPointsCount >= 2) {
            const pathNodes = [];
            [0, 1, 2].forEach(f => {
              floorPaths[f].forEach(pt => {
                pathNodes.push({
                  x: pt.x,
                  y: pt.y,
                  floor: f,
                  name: `Waypoint (${pt.x}, ${pt.y})`,
                  type: "custom"
                });
              });
            });

            let totalDistance = 0;
            [0, 1, 2].forEach(f => {
              const pts = floorPaths[f];
              for (let i = 0; i < pts.length - 1; i++) {
                const dx = pts[i + 1].x - pts[i].x;
                const dy = pts[i + 1].y - pts[i].y;
                totalDistance += Math.hypot(dx, dy) * 0.08;
              }
            });
            totalDistance = Math.max(15, Math.round(totalDistance));
            const estimatedMinutes = Math.max(1, Math.round(totalDistance / 1.15 / 60));

            const activeFloors = [0, 1, 2].filter(f => floorPaths[f].length > 0);
            let transitMethod = "Walk";
            if (activeFloors.length > 1) {
              transitMethod = avoidStairs ? "Lift" : "Stairs";
            }

            const startNode = buildingGraph.nodes[startNodeId] || { name: startNodeId, floor: activeFloors[0] || 0, x: pathNodes[0].x, y: pathNodes[0].y };
            const targetNode = buildingGraph.nodes[targetNodeId] || { name: `Room ${targetRoomId}`, floor: activeFloors[activeFloors.length - 1] || 0, x: pathNodes[pathNodes.length - 1].x, y: pathNodes[pathNodes.length - 1].y };

            const steps = [
              {
                instruction: `Start at ${startNode.name}`,
                detail: `Follow your visually mapped corridor route.`
              }
            ];

            if (activeFloors.length > 1) {
              for (let i = 0; i < activeFloors.length - 1; i++) {
                const fCurrent = activeFloors[i];
                const fNext = activeFloors[i + 1];
                const fNextName = fNext === 1 ? "1st Floor" : (fNext === 2 ? "2nd Floor" : "Ground Floor");
                steps.push({
                  instruction: `Transition to ${fNextName} (via Lift or Stairs)`,
                  detail: `Switch to floor ${fNext} to follow your next corridor leg.`
                });
              }
            }

            steps.push({
              instruction: `Arrive at ${targetNode.name}!`,
              detail: `You have arrived at your destination venue.`
            });

            return {
              startNode,
              targetNode,
              totalDistance,
              estimatedMinutes,
              transitMethod,
              pathNodes,
              floorPaths,
              steps,
              avoidStairs,
              isCustom: true
            };
          }
        }
      }
    } catch (err) {
      console.warn("Custom route lookup failed, falling back to Dijkstra graph", err);
    }
  }

  // Build adjacency list
  const adj = {};
  for (const k in buildingGraph.nodes) {
    adj[k] = [];
  }

  buildingGraph.edges.forEach(e => {
    if (avoidStairs && e.type === "stairs") return;

    adj[e.from].push({ node: e.to, weight: e.weight, type: e.type, text: e.text });
    adj[e.to].push({ node: e.from, weight: e.weight, type: e.type, text: e.text });
  });

  const distances = {};
  const previous = {};
  const unvisited = new Set();

  for (const k in buildingGraph.nodes) {
    distances[k] = Infinity;
    previous[k] = null;
    unvisited.add(k);
  }

  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let current = null;
    let minDist = Infinity;

    for (const nodeKey of unvisited) {
      if (distances[nodeKey] < minDist) {
        minDist = distances[nodeKey];
        current = nodeKey;
      }
    }

    if (current === null || minDist === Infinity) break;
    if (current === targetNodeId) break;

    unvisited.delete(current);

    const neighbors = adj[current] || [];
    for (const n of neighbors) {
      if (!unvisited.has(n.node)) continue;
      const alt = distances[current] + n.weight;
      if (alt < distances[n.node]) {
        distances[n.node] = alt;
        previous[n.node] = current;
      }
    }
  }

  if (distances[targetNodeId] === Infinity) return null;

  const pathNodes = [];
  let curr = targetNodeId;
  while (curr !== null) {
    pathNodes.unshift(buildingGraph.nodes[curr]);
    curr = previous[curr];
  }

  const totalDistance = Math.round(distances[targetNodeId]);
  const estimatedMinutes = Math.max(1, Math.round(totalDistance / 1.15 / 60));

  let transitMethod = "Walk";
  const usedStairs = pathNodes.some(n => n.type === "stairs");
  const usedLift = pathNodes.some(n => n.type === "lift");
  if (usedLift) {
    transitMethod = "Lift";
  } else if (usedStairs) {
    transitMethod = "Stairs";
  }

  const steps = generateStepDirections(pathNodes, avoidStairs);

  const floorPaths = { 0: [], 1: [], 2: [] };
  pathNodes.forEach(node => {
    if (floorPaths[node.floor] !== undefined) {
      floorPaths[node.floor].push(node);
    }
  });

  return {
    startNode: buildingGraph.nodes[startNodeId],
    targetNode: buildingGraph.nodes[targetNodeId],
    totalDistance,
    estimatedMinutes,
    transitMethod,
    pathNodes,
    floorPaths,
    steps,
    avoidStairs
  };
}

function generateStepDirections(pathNodes, avoidStairs) {
  const steps = [];
  if (pathNodes.length < 2) return steps;

  const startNode = pathNodes[0];
  steps.push({
    instruction: `Start at ${startNode.name}`,
    detail: "Follow the lighted campus signage."
  });

  for (let i = 1; i < pathNodes.length; i++) {
    const prev = pathNodes[i - 1];
    const curr = pathNodes[i];

    if (curr.floor !== prev.floor) {
      const isElevator = curr.type === "lift" || prev.type === "lift";
      const targetFloorName = curr.floor === 1 ? "1st Floor" : (curr.floor === 2 ? "2nd Floor" : "Ground Floor");

      steps.push({
        instruction: isElevator ? `Take the Central Elevator to ${targetFloorName}` : `Take the stairs up to ${targetFloorName}`,
        detail: isElevator ? `Press button '${curr.floor}' in the elevator.` : `Walk up the staircase to ${targetFloorName} landing.`
      });
      continue;
    }

    if (curr.type === "room" && i === pathNodes.length - 1) {
      steps.push({
        instruction: `Arrive at ${curr.name}!`,
        detail: "Look for the event banner outside the venue."
      });
    } else if (curr.type === "stairs" || curr.type === "lift") {
      if (i < pathNodes.length - 1 && pathNodes[i + 1].floor !== curr.floor) {
        // Floor transition handles this
      } else {
        steps.push({
          instruction: `Walk towards ${curr.name}`,
          detail: "Proceed along the corridor."
        });
      }
    } else if (curr.type === "facility") {
      steps.push({
        instruction: `Walk past ${curr.name}`,
        detail: "Continue along the pathway."
      });
    } else if (i === 1 && pathNodes.length > 2) {
      steps.push({
        instruction: `Proceed along ${curr.name}`,
        detail: "Follow the directional signs."
      });
    }
  }

  if (steps.length === 1) {
    const dest = pathNodes[pathNodes.length - 1];
    steps.push({
      instruction: `Walk straight to ${dest.name}`,
      detail: "Your destination is directly ahead."
    });
  }

  return steps;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildingGraph, roomToNodeMap, findShortestPath };
}
