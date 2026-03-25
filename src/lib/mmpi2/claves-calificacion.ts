// Claves de calificación MMPI-2
// Basado en la guía de Sanz (2008) - Universidad de Buenos Aires
// Formato: Los ítems con prefijo 'V' suman cuando se responde Verdadero
//          Los ítems con prefijo 'F' suman cuando se responde Falso

export interface ClaveEscala {
  verdaderos: number[];  // Ítems que puntúan cuando se responde Verdadero
  falsos: number[];      // Ítems que puntúan cuando se responde Falso
}

// ESCALAS BÁSICAS

export const ESCALA_L: ClaveEscala = {
  verdaderos: [],
  falsos: [16, 29, 41, 51, 77, 93, 102, 107, 123, 139, 153, 183, 203, 232, 260]
};

export const ESCALA_F: ClaveEscala = {
  verdaderos: [18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 84, 96, 114, 138, 144, 150, 156, 162, 168, 180, 198, 216, 228, 234, 240, 246, 252, 258, 264, 270, 282, 288, 294, 300, 306, 312, 324, 336, 349, 355, 361],
  falsos: [6, 12, 78, 90, 108, 120, 126, 132, 174, 186, 192, 204, 210, 222, 276, 318, 330, 343]
};

export const ESCALA_K: ClaveEscala = {
  verdaderos: [83],
  falsos: [29, 37, 58, 76, 110, 116, 122, 127, 130, 136, 148, 157, 158, 167, 171, 196, 213, 243, 267, 284, 290, 330, 338, 339, 341, 346, 348, 356, 365]
};

export const ESCALA_HS: ClaveEscala = {
  verdaderos: [18, 28, 39, 53, 59, 97, 101, 111, 149, 175, 247],
  falsos: [2, 3, 8, 10, 20, 45, 47, 57, 91, 117, 141, 143, 152, 164, 173, 176, 179, 208, 224, 249, 255]
};

export const ESCALA_D: ClaveEscala = {
  verdaderos: [5, 15, 18, 31, 38, 39, 46, 56, 73, 92, 117, 127, 130, 146, 147, 170, 175, 181, 215, 233],
  falsos: [2, 9, 10, 20, 29, 33, 37, 43, 45, 49, 55, 68, 75, 76, 95, 109, 118, 134, 140, 141, 142, 143, 148, 165, 178, 188, 189, 212, 221, 223, 226, 238, 245, 248, 260, 267, 330]
};

export const ESCALA_HY: ClaveEscala = {
  verdaderos: [11, 18, 31, 39, 40, 44, 65, 101, 166, 172, 175, 218, 230],
  falsos: [2, 3, 7, 8, 9, 10, 14, 26, 29, 45, 47, 58, 76, 81, 91, 95, 98, 110, 115, 116, 124, 125, 129, 135, 141, 148, 151, 152, 157, 159, 161, 164, 167, 173, 176, 179, 185, 193, 208, 213, 224, 241, 243, 249, 253, 263, 265]
};

export const ESCALA_PD: ClaveEscala = {
  verdaderos: [17, 21, 22, 31, 32, 35, 42, 52, 54, 56, 71, 82, 89, 94, 99, 105, 113, 195, 202, 219, 225, 259, 264, 288],
  falsos: [9, 12, 34, 70, 79, 83, 95, 122, 125, 129, 143, 157, 158, 160, 167, 171, 185, 209, 214, 217, 226, 243, 261, 263, 266, 267]
};

export const ESCALA_MF_MASCULINO: ClaveEscala = {
  verdaderos: [4, 25, 62, 64, 67, 74, 80, 112, 119, 122, 128, 137, 166, 177, 187, 191, 196, 205, 209, 219, 236, 251, 256, 268, 271],
  falsos: [1, 19, 26, 27, 63, 68, 69, 76, 86, 103, 104, 107, 120, 121, 132, 133, 163, 184, 193, 194, 197, 199, 201, 207, 231, 235, 237, 239, 254, 257, 272]
};

export const ESCALA_MF_FEMENINO: ClaveEscala = {
  verdaderos: [4, 25, 62, 64, 67, 74, 80, 112, 119, 121, 122, 128, 137, 177, 187, 191, 196, 205, 219, 236, 251, 256, 271],
  falsos: [1, 19, 26, 27, 63, 68, 69, 76, 86, 103, 104, 107, 120, 132, 133, 163, 166, 184, 193, 194, 197, 199, 201, 207, 209, 231, 235, 237, 239, 254, 257, 268, 272]
};

export const ESCALA_PA: ClaveEscala = {
  verdaderos: [16, 17, 22, 23, 24, 42, 99, 113, 138, 144, 145, 146, 162, 234, 259, 271, 277, 285, 305, 307, 333, 334, 336, 355, 361],
  falsos: [81, 95, 98, 100, 104, 110, 244, 255, 266, 283, 284, 286, 297, 314, 315]
};

export const ESCALA_PT: ClaveEscala = {
  verdaderos: [11, 16, 23, 31, 38, 56, 65, 73, 82, 89, 94, 130, 147, 170, 175, 196, 218, 242, 273, 275, 277, 285, 289, 301, 302, 304, 308, 309, 310, 313, 316, 317, 320, 325, 326, 327, 328, 329, 331],
  falsos: [3, 9, 33, 109, 140, 165, 174, 293, 321]
};

export const ESCALA_SC: ClaveEscala = {
  verdaderos: [16, 17, 21, 22, 23, 31, 32, 35, 38, 42, 44, 46, 48, 65, 85, 92, 138, 145, 147, 166, 168, 170, 180, 182, 190, 218, 221, 229, 233, 234, 242, 247, 252, 256, 268, 273, 274, 277, 279, 281, 287, 291, 292, 296, 298, 299, 303, 307, 311, 316, 319, 320, 322, 323, 325, 329, 332, 333, 355],
  falsos: [6, 9, 12, 34, 90, 91, 106, 165, 177, 179, 192, 210, 255, 276, 278, 280, 290, 295, 343]
};

export const ESCALA_MA: ClaveEscala = {
  verdaderos: [13, 15, 21, 23, 50, 55, 61, 85, 87, 98, 113, 122, 131, 145, 155, 168, 169, 182, 190, 200, 205, 206, 211, 212, 218, 220, 227, 229, 238, 242, 244, 248, 250, 253, 269],
  falsos: [88, 93, 100, 106, 107, 136, 154, 158, 167, 243, 263]
};

export const ESCALA_SI: ClaveEscala = {
  verdaderos: [31, 56, 70, 100, 104, 110, 127, 135, 158, 161, 167, 185, 215, 243, 251, 265, 275, 284, 289, 296, 302, 308, 326, 328, 337, 338, 347, 348, 351, 352, 357, 358, 364, 367, 368, 369],
  falsos: [25, 32, 49, 79, 86, 106, 112, 131, 181, 189, 207, 209, 231, 237, 255, 262, 267, 280, 321, 335, 340, 342, 344, 345, 350, 353, 354, 359, 360, 362, 363, 366, 370]
};

// ESCALAS SUPLEMENTARIAS

export const ESCALA_A: ClaveEscala = {
  verdaderos: [31, 38, 56, 65, 82, 127, 135, 215, 233, 243, 251, 273, 277, 289, 301, 309, 310, 311, 325, 328, 338, 339, 341, 347, 390, 391, 394, 400, 408, 411, 415, 421, 428, 442, 448, 451, 464, 469],
  falsos: [388]
};

export const ESCALA_R: ClaveEscala = {
  verdaderos: [],
  falsos: [1, 7, 10, 14, 37, 45, 69, 112, 118, 120, 128, 134, 142, 168, 178, 189, 197, 199, 248, 255, 256, 297, 330, 346, 350, 353, 354, 359, 363, 365, 422, 423, 430, 432, 449, 456, 465]
};

export const ESCALA_ES: ClaveEscala = {
  verdaderos: [2, 33, 45, 98, 141, 159, 169, 177, 179, 189, 199, 209, 213, 230, 245, 323, 385, 406, 413, 425],
  falsos: [23, 31, 32, 36, 39, 53, 60, 70, 82, 87, 119, 128, 175, 196, 215, 221, 225, 229, 236, 246, 307, 310, 316, 328, 391, 394, 441, 447, 458, 464, 469, 471]
};

export const ESCALA_MACR: ClaveEscala = {
  verdaderos: [7, 24, 36, 49, 52, 69, 72, 82, 84, 103, 105, 113, 115, 128, 168, 172, 202, 214, 224, 229, 238, 257, 280, 342, 344, 387, 407, 412, 414, 422, 434, 439, 445, 456, 473, 502, 506, 549],
  falsos: [73, 107, 117, 137, 160, 166, 251, 266, 287, 299, 325]
};

export const ESCALA_OH: ClaveEscala = {
  verdaderos: [67, 79, 207, 286, 305, 398, 471],
  falsos: [1, 15, 29, 69, 77, 89, 98, 116, 117, 129, 153, 169, 171, 293, 344, 390, 400, 420, 433, 440, 460]
};

export const ESCALA_DO: ClaveEscala = {
  verdaderos: [55, 207, 232, 245, 386, 416],
  falsos: [31, 52, 70, 73, 82, 172, 201, 202, 220, 227, 243, 244, 275, 309, 325, 399, 412, 470, 473]
};

export const ESCALA_RE: ClaveEscala = {
  verdaderos: [100, 160, 199, 266, 440, 467],
  falsos: [7, 27, 29, 32, 84, 103, 105, 145, 169, 201, 202, 235, 275, 358, 412, 417, 418, 430, 431, 432, 456, 468, 470]
};

export const ESCALA_MT: ClaveEscala = {
  verdaderos: [15, 16, 28, 31, 38, 71, 73, 81, 82, 110, 130, 215, 218, 233, 269, 273, 299, 302, 325, 331, 339, 357, 408, 411, 449, 464, 469, 472],
  falsos: [2, 3, 9, 10, 20, 43, 95, 131, 140, 148, 152, 223, 405]
};

export const ESCALA_GM: ClaveEscala = {
  verdaderos: [8, 20, 143, 152, 159, 163, 176, 199, 214, 237, 321, 350, 385, 388, 401, 440, 462, 467, 474],
  falsos: [4, 23, 44, 64, 70, 73, 74, 80, 100, 137, 146, 187, 289, 331, 351, 364, 392, 395, 435, 438, 441, 469, 471, 498, 509, 519, 532, 536]
};

export const ESCALA_GF: ClaveEscala = {
  verdaderos: [62, 67, 119, 121, 128, 203, 263, 266, 353, 384, 426, 449, 456, 473, 552],
  falsos: [1, 27, 63, 68, 79, 84, 105, 123, 133, 155, 197, 201, 220, 231, 238, 239, 250, 257, 264, 272, 287, 406, 417, 465, 477, 487, 510, 511, 537, 548, 550]
};

export const ESCALA_PK: ClaveEscala = {
  verdaderos: [16, 17, 22, 23, 30, 31, 32, 37, 39, 48, 52, 56, 59, 65, 82, 85, 92, 94, 101, 135, 150, 168, 170, 196, 221, 274, 277, 302, 303, 305, 316, 319, 327, 328, 339, 347, 349, 367],
  falsos: [2, 3, 9, 49, 75, 95, 125, 140]
};

export const ESCALA_PS: ClaveEscala = {
  verdaderos: [17, 21, 22, 31, 32, 37, 38, 44, 48, 56, 59, 65, 85, 94, 116, 135, 145, 150, 168, 170, 180, 218, 221, 273, 274, 277, 299, 301, 304, 305, 311, 316, 319, 325, 328, 377, 386, 400, 463, 464, 469, 471, 475, 479, 515, 516, 565],
  falsos: [3, 9, 45, 75, 95, 141, 165, 208, 223, 280, 372, 405, 564]
};

export const ESCALA_MDS: ClaveEscala = {
  verdaderos: [21, 22, 135, 195, 219, 382, 484, 563],
  falsos: [12, 83, 95, 125, 493, 494]
};

export const ESCALA_APS: ClaveEscala = {
  verdaderos: [7, 29, 41, 89, 103, 113, 120, 168, 183, 189, 196, 217, 242, 260, 267, 341, 342, 344, 377, 422, 502, 523, 540],
  falsos: [4, 43, 76, 104, 137, 157, 220, 239, 306, 312, 349, 440, 495, 496, 500, 504]
};

export const ESCALA_AAS: ClaveEscala = {
  verdaderos: [172, 264, 288, 362, 387, 487, 489, 511, 527, 544],
  falsos: [266, 429, 501]
};

// ESCALAS ADICIONALES DE VALIDEZ

export const ESCALA_FB: ClaveEscala = {
  verdaderos: [281, 291, 303, 311, 317, 319, 322, 323, 329, 332, 333, 334, 387, 395, 407, 431, 450, 454, 463, 468, 476, 478, 484, 489, 506, 516, 517, 520, 524, 525, 526, 528, 530, 539, 540, 544, 555],
  falsos: [383, 404, 501]
};

export const ESCALA_FP: ClaveEscala = {
  verdaderos: [66, 114, 162, 193, 216, 228, 252, 270, 282, 291, 294, 322, 323, 336, 371, 387, 478, 555],
  falsos: [51, 77, 90, 93, 102, 126, 192, 276, 501]
};

export const ESCALA_DS: ClaveEscala = {
  verdaderos: [11, 17, 18, 19, 22, 28, 30, 31, 40, 42, 44, 54, 61, 72, 81, 85, 92, 111, 166, 190, 195, 205, 221, 252, 258, 268, 274, 287, 292, 294, 300, 307, 310, 320, 329, 362, 395, 412, 419, 421, 431, 433, 435, 436, 451, 458, 463],
  falsos: [57, 75, 83, 108, 125, 188, 278, 318, 404, 429]
};

export const ESCALA_DSR: ClaveEscala = {
  verdaderos: [11, 18, 22, 28, 30, 31, 40, 44, 81, 85, 92, 111, 205, 221, 274, 292, 300, 320, 329, 362, 395, 419, 433, 451, 458, 463],
  falsos: [57, 75, 83, 108, 278, 318]
};

export const ESCALA_S: ClaveEscala = {
  verdaderos: [121, 148, 184, 194, 534, 560],
  falsos: [15, 50, 58, 76, 81, 87, 89, 104, 110, 120, 123, 154, 196, 205, 213, 225, 264, 279, 284, 290, 302, 337, 341, 346, 352, 373, 374, 403, 420, 423, 428, 430, 433, 442, 445, 449, 461, 486, 487, 523, 538, 542, 545, 547]
};

export const ESCALA_SD: ClaveEscala = {
  verdaderos: [25, 49, 80, 100, 131, 133, 184, 194, 201, 206, 207, 211, 220, 249, 257, 263, 345, 351, 354, 356, 366, 402, 416, 439],
  falsos: [29, 41, 77, 93, 183, 203, 232, 326, 341]
};

export const ESCALA_SO: ClaveEscala = {
  verdaderos: [8, 20, 78, 95, 152, 186, 318, 335],
  falsos: [31, 39, 48, 54, 127, 136, 146, 158, 168, 172, 221, 238, 243, 270, 273, 288, 289, 299, 300, 301, 306, 320, 324, 338, 349, 368, 415, 420, 469]
};

// ESCALAS DE CONTENIDO

export const ESCALA_ANX: ClaveEscala = {
  verdaderos: [15, 30, 31, 39, 170, 196, 273, 290, 299, 301, 305, 339, 408, 415, 463, 469, 509, 556],
  falsos: [140, 208, 223, 405, 496]
};

export const ESCALA_FRS: ClaveEscala = {
  verdaderos: [154, 317, 322, 329, 334, 392, 395, 397, 435, 438, 441, 447, 458, 468, 471, 555],
  falsos: [115, 163, 186, 385, 401, 453, 462]
};

export const ESCALA_OBS: ClaveEscala = {
  verdaderos: [55, 87, 135, 196, 309, 313, 327, 328, 394, 442, 482, 491, 497, 509, 547, 553],
  falsos: []
};

export const ESCALA_DEP_CONT: ClaveEscala = {
  verdaderos: [38, 52, 56, 65, 71, 82, 92, 130, 146, 215, 234, 246, 277, 303, 306, 331, 377, 399, 400, 411, 454, 506, 512, 516, 520, 539, 546, 554],
  falsos: [3, 9, 75, 95, 388]
};

export const ESCALA_HEA: ClaveEscala = {
  verdaderos: [11, 18, 28, 36, 40, 44, 53, 59, 97, 101, 111, 149, 175, 247],
  falsos: [20, 33, 45, 47, 57, 91, 117, 118, 141, 142, 159, 164, 176, 179, 181, 194, 204, 224, 249, 255, 295, 404]
};

export const ESCALA_BIZ: ClaveEscala = {
  verdaderos: [24, 32, 60, 96, 138, 162, 198, 228, 259, 298, 311, 316, 319, 333, 336, 355, 361, 466, 490, 508, 543, 551],
  falsos: [427]
};

export const ESCALA_ANG: ClaveEscala = {
  verdaderos: [29, 37, 116, 134, 302, 389, 410, 414, 430, 461, 486, 513, 540, 542, 548],
  falsos: [564]
};

export const ESCALA_CYN: ClaveEscala = {
  verdaderos: [50, 58, 76, 81, 104, 110, 124, 225, 241, 254, 283, 284, 286, 315, 346, 352, 358, 374, 399, 403, 445, 470, 538],
  falsos: []
};

export const ESCALA_ASP_CONT: ClaveEscala = {
  verdaderos: [26, 35, 66, 81, 84, 104, 105, 110, 123, 227, 240, 248, 250, 254, 269, 283, 284, 374, 412, 418, 419],
  falsos: [266]
};

export const ESCALA_TPA: ClaveEscala = {
  verdaderos: [27, 136, 151, 212, 302, 358, 414, 419, 420, 423, 430, 437, 507, 510, 523, 531, 535, 541, 545],
  falsos: []
};

export const ESCALA_LSE: ClaveEscala = {
  verdaderos: [70, 73, 130, 235, 326, 369, 376, 380, 411, 421, 450, 457, 475, 476, 483, 485, 503, 504, 519, 526, 562],
  falsos: [61, 78, 109]
};

export const ESCALA_SOD: ClaveEscala = {
  verdaderos: [46, 158, 167, 185, 265, 275, 281, 337, 349, 367, 479, 480, 515],
  falsos: [49, 86, 262, 280, 321, 340, 353, 359, 360, 363, 370]
};

export const ESCALA_FAM: ClaveEscala = {
  verdaderos: [21, 54, 145, 190, 195, 205, 256, 292, 300, 323, 378, 379, 382, 413, 449, 478, 543, 550, 563, 567],
  falsos: [83, 125, 217, 383, 455]
};

export const ESCALA_WRK: ClaveEscala = {
  verdaderos: [15, 17, 31, 54, 73, 98, 135, 233, 243, 299, 302, 339, 364, 368, 394, 409, 428, 445, 464, 491, 505, 509, 517, 525, 545, 554, 559, 566],
  falsos: [10, 108, 318, 521, 561]
};

export const ESCALA_TRT: ClaveEscala = {
  verdaderos: [22, 92, 274, 306, 364, 368, 373, 375, 376, 377, 391, 399, 482, 488, 491, 495, 497, 499, 500, 504, 528, 539, 554],
  falsos: [493, 494, 501]
};

// SUBESCALAS HARRIS-LINGOES

export const SUB_D1: ClaveEscala = {
  verdaderos: [31, 38, 39, 46, 56, 73, 92, 127, 130, 146, 147, 170, 175, 215, 233],
  falsos: [2, 9, 43, 49, 75, 95, 109, 118, 140, 148, 178, 188, 189, 223, 260, 267, 330]
};

export const SUB_D2: ClaveEscala = {
  verdaderos: [38, 46, 170, 233],
  falsos: [9, 29, 37, 49, 55, 76, 134, 188, 189, 212]
};

export const SUB_D3: ClaveEscala = {
  verdaderos: [18, 117, 175, 181],
  falsos: [2, 20, 45, 141, 142, 143, 148]
};

export const SUB_D4: ClaveEscala = {
  verdaderos: [15, 31, 38, 73, 92, 147, 170, 233],
  falsos: [9, 10, 43, 75, 109, 165, 188]
};

export const SUB_D5: ClaveEscala = {
  verdaderos: [38, 56, 92, 127, 130, 146, 170, 215],
  falsos: [75, 95]
};

export const SUB_HY1: ClaveEscala = {
  verdaderos: [],
  falsos: [129, 161, 167, 185, 243, 265]
};

export const SUB_HY2: ClaveEscala = {
  verdaderos: [230],
  falsos: [26, 58, 76, 81, 98, 110, 124, 151, 213, 241, 263]
};

export const SUB_HY3: ClaveEscala = {
  verdaderos: [31, 39, 65, 175, 218],
  falsos: [2, 3, 9, 10, 45, 95, 125, 141, 148, 152]
};

export const SUB_HY4: ClaveEscala = {
  verdaderos: [11, 18, 40, 44, 101, 172],
  falsos: [8, 47, 91, 159, 164, 173, 176, 179, 208, 224, 249]
};

export const SUB_HY5: ClaveEscala = {
  verdaderos: [],
  falsos: [7, 14, 29, 115, 116, 135, 157]
};

export const SUB_PD1: ClaveEscala = {
  verdaderos: [21, 54, 195, 202, 288],
  falsos: [83, 125, 214, 217]
};

export const SUB_PD2: ClaveEscala = {
  verdaderos: [35, 105],
  falsos: [34, 70, 129, 160, 263, 266]
};

export const SUB_PD3: ClaveEscala = {
  verdaderos: [],
  falsos: [70, 129, 158, 167, 185, 243]
};

export const SUB_PD4: ClaveEscala = {
  verdaderos: [17, 22, 42, 56, 82, 99, 113, 219, 225, 259],
  falsos: [12, 129, 157]
};

export const SUB_PD5: ClaveEscala = {
  verdaderos: [31, 32, 52, 56, 71, 82, 89, 94, 113, 264],
  falsos: [9, 95]
};

export const SUB_PA1: ClaveEscala = {
  verdaderos: [17, 22, 42, 99, 113, 138, 144, 145, 162, 234, 259, 305, 333, 336, 355, 361],
  falsos: [314]
};

export const SUB_PA2: ClaveEscala = {
  verdaderos: [22, 146, 271, 277, 285, 307, 334],
  falsos: [100, 244]
};

export const SUB_PA3: ClaveEscala = {
  verdaderos: [16],
  falsos: [81, 98, 104, 110, 283, 284, 286, 315]
};

export const SUB_SC1: ClaveEscala = {
  verdaderos: [17, 21, 22, 42, 46, 138, 145, 190, 221, 256, 277, 281, 291, 292, 320, 333],
  falsos: [90, 276, 278, 280, 343]
};

export const SUB_SC2: ClaveEscala = {
  verdaderos: [65, 92, 234, 273, 303, 323, 329, 332],
  falsos: [9, 210, 290]
};

export const SUB_SC3: ClaveEscala = {
  verdaderos: [31, 32, 147, 170, 180, 299, 311, 316, 325],
  falsos: [165]
};

export const SUB_SC4: ClaveEscala = {
  verdaderos: [31, 38, 48, 65, 92, 233, 234, 273, 299, 303, 325],
  falsos: [9, 210, 290]
};

export const SUB_SC5: ClaveEscala = {
  verdaderos: [23, 85, 168, 182, 218, 242, 274, 320, 322, 329, 355],
  falsos: []
};

export const SUB_SC6: ClaveEscala = {
  verdaderos: [23, 32, 44, 168, 182, 229, 247, 252, 296, 298, 307, 311, 319, 355],
  falsos: [91, 106, 177, 179, 255, 295]
};

export const SUB_MA1: ClaveEscala = {
  verdaderos: [131, 227, 248, 250, 269],
  falsos: [263]
};

export const SUB_MA2: ClaveEscala = {
  verdaderos: [15, 85, 87, 122, 169, 206, 218, 242, 244],
  falsos: [100, 106]
};

export const SUB_MA3: ClaveEscala = {
  verdaderos: [155, 200, 220],
  falsos: [93, 136, 158, 167, 243]
};

export const SUB_MA4: ClaveEscala = {
  verdaderos: [13, 50, 55, 61, 98, 145, 190, 211, 212],
  falsos: []
};

export const SUB_SI1: ClaveEscala = {
  verdaderos: [158, 161, 167, 185, 243, 265, 275, 289],
  falsos: [49, 262, 280, 321, 342, 360]
};

export const SUB_SI2: ClaveEscala = {
  verdaderos: [337, 367],
  falsos: [86, 340, 353, 359, 363, 370]
};

export const SUB_SI3: ClaveEscala = {
  verdaderos: [31, 56, 104, 110, 135, 284, 302, 308, 326, 328, 338, 347, 348, 358, 364, 368, 369],
  falsos: []
};

// VRIN - Pares de ítems inconsistentes
// Cada par suma 1 punto si ambas respuestas coinciden en la dirección indicada

export const PARES_VRIN = [
  { item1: 3, dir1: 'V', item2: 39, dir2: 'V' },
  { item1: 6, dir1: 'V', item2: 90, dir2: 'F' },
  { item1: 6, dir1: 'F', item2: 90, dir2: 'V' },
  { item1: 9, dir1: 'V', item2: 56, dir2: 'V' },
  { item1: 28, dir1: 'V', item2: 59, dir2: 'F' },
  { item1: 31, dir1: 'V', item2: 299, dir2: 'F' },
  { item1: 32, dir1: 'F', item2: 316, dir2: 'V' },
  { item1: 40, dir1: 'V', item2: 176, dir2: 'V' },
  { item1: 46, dir1: 'V', item2: 265, dir2: 'F' },
  { item1: 48, dir1: 'V', item2: 184, dir2: 'V' },
  { item1: 49, dir1: 'V', item2: 280, dir2: 'F' },
  { item1: 73, dir1: 'V', item2: 377, dir2: 'F' },
  { item1: 81, dir1: 'V', item2: 284, dir2: 'F' },
  { item1: 81, dir1: 'F', item2: 284, dir2: 'V' },
  { item1: 83, dir1: 'V', item2: 288, dir2: 'V' },
  { item1: 84, dir1: 'V', item2: 105, dir2: 'F' },
  { item1: 86, dir1: 'V', item2: 359, dir2: 'F' },
  { item1: 95, dir1: 'F', item2: 388, dir2: 'V' },
  { item1: 99, dir1: 'F', item2: 138, dir2: 'V' },
  { item1: 103, dir1: 'V', item2: 344, dir2: 'F' },
  { item1: 110, dir1: 'V', item2: 374, dir2: 'F' },
  { item1: 110, dir1: 'F', item2: 374, dir2: 'V' },
  { item1: 116, dir1: 'V', item2: 430, dir2: 'F' },
  { item1: 125, dir1: 'V', item2: 195, dir2: 'V' },
  { item1: 125, dir1: 'F', item2: 195, dir2: 'F' },
  { item1: 135, dir1: 'V', item2: 482, dir2: 'V' },
  { item1: 136, dir1: 'V', item2: 507, dir2: 'F' },
  { item1: 136, dir1: 'F', item2: 507, dir2: 'V' },
  { item1: 152, dir1: 'F', item2: 464, dir2: 'F' },
  { item1: 161, dir1: 'V', item2: 185, dir2: 'F' },
  { item1: 161, dir1: 'F', item2: 185, dir2: 'V' },
  { item1: 165, dir1: 'F', item2: 565, dir2: 'F' },
  { item1: 166, dir1: 'V', item2: 268, dir2: 'F' },
  { item1: 166, dir1: 'F', item2: 268, dir2: 'V' },
  { item1: 167, dir1: 'V', item2: 243, dir2: 'F' },
  { item1: 167, dir1: 'F', item2: 243, dir2: 'V' },
  { item1: 196, dir1: 'F', item2: 415, dir2: 'V' },
  { item1: 199, dir1: 'V', item2: 467, dir2: 'F' },
  { item1: 199, dir1: 'F', item2: 467, dir2: 'V' },
  { item1: 226, dir1: 'V', item2: 267, dir2: 'F' },
  { item1: 259, dir1: 'F', item2: 333, dir2: 'V' },
  { item1: 262, dir1: 'F', item2: 275, dir2: 'F' },
  { item1: 290, dir1: 'V', item2: 556, dir2: 'F' },
  { item1: 290, dir1: 'F', item2: 556, dir2: 'V' },
  { item1: 339, dir1: 'F', item2: 394, dir2: 'V' },
  { item1: 349, dir1: 'V', item2: 515, dir2: 'F' },
  { item1: 349, dir1: 'F', item2: 515, dir2: 'V' },
  { item1: 350, dir1: 'F', item2: 521, dir2: 'F' },
  { item1: 353, dir1: 'V', item2: 370, dir2: 'F' },
  { item1: 353, dir1: 'F', item2: 370, dir2: 'V' },
  { item1: 364, dir1: 'V', item2: 554, dir2: 'F' },
  { item1: 369, dir1: 'F', item2: 421, dir2: 'V' },
  { item1: 372, dir1: 'V', item2: 405, dir2: 'F' },
  { item1: 372, dir1: 'F', item2: 405, dir2: 'V' },
  { item1: 380, dir1: 'V', item2: 562, dir2: 'F' },
  { item1: 395, dir1: 'V', item2: 435, dir2: 'F' },
  { item1: 395, dir1: 'F', item2: 435, dir2: 'V' },
  { item1: 396, dir1: 'V', item2: 403, dir2: 'F' },
  { item1: 396, dir1: 'F', item2: 403, dir2: 'V' },
  { item1: 411, dir1: 'V', item2: 485, dir2: 'F' },
  { item1: 411, dir1: 'F', item2: 485, dir2: 'V' },
  { item1: 472, dir1: 'V', item2: 533, dir2: 'F' },
  { item1: 472, dir1: 'F', item2: 533, dir2: 'V' },
  { item1: 491, dir1: 'V', item2: 509, dir2: 'F' },
  { item1: 506, dir1: 'V', item2: 520, dir2: 'F' },
  { item1: 506, dir1: 'F', item2: 520, dir2: 'V' },
  { item1: 513, dir1: 'V', item2: 542, dir2: 'F' },
];

// TRIN - Pares de ítems inconsistentes
// Sumar 1 punto por cada par V-V coincidente
// Restar 1 punto por cada par F-F coincidente
// Finalmente sumar 9 puntos al resultado

export const PARES_TRIN_SUMAR = [
  { item1: 3, item2: 39 },
  { item1: 12, item2: 166 },
  { item1: 40, item2: 176 },
  { item1: 48, item2: 184 },
  { item1: 63, item2: 127 },
  { item1: 65, item2: 95 },
  { item1: 73, item2: 239 },
  { item1: 83, item2: 288 },
  { item1: 99, item2: 314 },
  { item1: 125, item2: 195 },
  { item1: 209, item2: 351 },
  { item1: 359, item2: 367 },
  { item1: 377, item2: 534 },
  { item1: 556, item2: 560 },
];

export const PARES_TRIN_RESTAR = [
  { item1: 9, item2: 56 },
  { item1: 65, item2: 95 },
  { item1: 125, item2: 195 },
  { item1: 140, item2: 196 },
  { item1: 152, item2: 464 },
  { item1: 165, item2: 565 },
  { item1: 262, item2: 275 },
  { item1: 265, item2: 360 },
  { item1: 359, item2: 367 },
];

// Función para obtener todas las claves
export function obtenerClavesEscalas() {
  return {
    // Escalas básicas
    L: ESCALA_L,
    F: ESCALA_F,
    K: ESCALA_K,
    Hs: ESCALA_HS,
    D: ESCALA_D,
    Hy: ESCALA_HY,
    Pd: ESCALA_PD,
    MfM: ESCALA_MF_MASCULINO,
    MfF: ESCALA_MF_FEMENINO,
    Pa: ESCALA_PA,
    Pt: ESCALA_PT,
    Sc: ESCALA_SC,
    Ma: ESCALA_MA,
    Si: ESCALA_SI,
    
    // Escalas suplementarias
    A: ESCALA_A,
    R: ESCALA_R,
    Es: ESCALA_ES,
    MACR: ESCALA_MACR,
    OH: ESCALA_OH,
    Do: ESCALA_DO,
    Re: ESCALA_RE,
    Mt: ESCALA_MT,
    GM: ESCALA_GM,
    GF: ESCALA_GF,
    PK: ESCALA_PK,
    PS: ESCALA_PS,
    MDS: ESCALA_MDS,
    APS: ESCALA_APS,
    AAS: ESCALA_AAS,
    
    // Escalas de validez adicionales
    Fb: ESCALA_FB,
    Fp: ESCALA_FP,
    DS: ESCALA_DS,
    DSr: ESCALA_DSR,
    S: ESCALA_S,
    Sd: ESCALA_SD,
    So: ESCALA_SO,
    
    // Escalas de contenido
    ANX: ESCALA_ANX,
    FRS: ESCALA_FRS,
    OBS: ESCALA_OBS,
    DEP_CONT: ESCALA_DEP_CONT,
    HEA: ESCALA_HEA,
    BIZ: ESCALA_BIZ,
    ANG: ESCALA_ANG,
    CYN: ESCALA_CYN,
    ASP_CONT: ESCALA_ASP_CONT,
    TPA: ESCALA_TPA,
    LSE: ESCALA_LSE,
    SOD: ESCALA_SOD,
    FAM: ESCALA_FAM,
    WRK: ESCALA_WRK,
    TRT: ESCALA_TRT,
    
    // Subescalas Harris-Lingoes
    D1: SUB_D1,
    D2: SUB_D2,
    D3: SUB_D3,
    D4: SUB_D4,
    D5: SUB_D5,
    Hy1: SUB_HY1,
    Hy2: SUB_HY2,
    Hy3: SUB_HY3,
    Hy4: SUB_HY4,
    Hy5: SUB_HY5,
    Pd1: SUB_PD1,
    Pd2: SUB_PD2,
    Pd3: SUB_PD3,
    Pd4: SUB_PD4,
    Pd5: SUB_PD5,
    Pa1: SUB_PA1,
    Pa2: SUB_PA2,
    Pa3: SUB_PA3,
    Sc1: SUB_SC1,
    Sc2: SUB_SC2,
    Sc3: SUB_SC3,
    Sc4: SUB_SC4,
    Sc5: SUB_SC5,
    Sc6: SUB_SC6,
    Ma1: SUB_MA1,
    Ma2: SUB_MA2,
    Ma3: SUB_MA3,
    Ma4: SUB_MA4,
    Si1: SUB_SI1,
    Si2: SUB_SI2,
    Si3: SUB_SI3,
  };
}
