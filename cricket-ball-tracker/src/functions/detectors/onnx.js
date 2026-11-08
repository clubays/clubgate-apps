/**
 * ONNX Model Adapter Stub
 * 
 * To use a YOLO or dedicated cricket ball neural detector in the future:
 * 1. Install 'onnxruntime-web'
 * 2. Load model weights (e.g. yolo11n-ball.onnx) in init()
 * 3. Convert frame imageData to model tensor format (e.g. 1x3x640x640 RGB float32)
 * 4. Run inference session and return candidate objects:
 *    { x, y, r, score, area }
 */

export class OnnxBallDetector {
  constructor(modelUrl = '/models/ball_detector.onnx') {
    this.modelUrl = modelUrl;
    this.session = null;
    this.isReady = false;
  }

  async init() {
    // Stub: not wired by default. Returns false to gracefully fallback to classical pipeline
    console.info(`[OnnxBallDetector] ONNX runtime stub initialized for ${this.modelUrl}`);
    this.isReady = false;
    return false;
  }

  async detect(imageData, options = {}) {
    if (!this.isReady) {
      throw new Error('ONNX detector is not initialized. Use ClassicalBallDetector instead.');
    }
    return [];
  }
}
