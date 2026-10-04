const FEATURE_KEYS = ['cuisine', 'budget', 'proximity', 'dietary', 'services', 'rating'];
const MIN_EXAMPLES = 8;
const MIN_PER_CLASS = 2;

function sigmoid(value) {
  if (value < -30) return 0;
  if (value > 30) return 1;
  return 1 / (1 + Math.exp(-value));
}

/** Fit a small regularized logistic-regression model for one user's feedback. */
function train(examples, featureBuilder) {
  const samples = examples.map((example) => ({
    x: featureBuilder(example.restaurant, example.preferenceSnapshot)
      .map((value) => Math.max(0, Math.min(1, Number(value) / 100))),
    y: example.sentiment > 0 ? 1 : 0,
  }));
  const positives = samples.filter((sample) => sample.y === 1).length;
  const negatives = samples.length - positives;

  if (
    samples.length < MIN_EXAMPLES ||
    positives < MIN_PER_CLASS ||
    negatives < MIN_PER_CLASS
  ) {
    return {
      model: null,
      feedbackCount: samples.length,
      positiveCount: positives,
      negativeCount: negatives,
    };
  }

  const weights = Array(FEATURE_KEYS.length).fill(0);
  let bias = Math.log((positives + 1) / (negatives + 1));
  const learningRate = 0.12;
  const regularization = 0.025;
  const epochs = 400;

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    const weightGradient = Array(FEATURE_KEYS.length).fill(0);
    let biasGradient = 0;

    for (const sample of samples) {
      const prediction = sigmoid(bias + weights.reduce((sum, weight, index) => sum + weight * sample.x[index], 0));
      const error = prediction - sample.y;
      biasGradient += error;
      for (let index = 0; index < weights.length; index += 1) {
        weightGradient[index] += error * sample.x[index];
      }
    }

    bias -= learningRate * (biasGradient / samples.length);
    for (let index = 0; index < weights.length; index += 1) {
      weights[index] -= learningRate * (
        weightGradient[index] / samples.length + regularization * weights[index]
      );
    }
  }

  return {
    model: { weights, bias },
    feedbackCount: samples.length,
    positiveCount: positives,
    negativeCount: negatives,
  };
}

function predict(model, featureValues) {
  const vector = featureValues.map((value) => Math.max(0, Math.min(1, Number(value) / 100)));
  return sigmoid(model.bias + model.weights.reduce((sum, weight, index) => sum + weight * vector[index], 0));
}

module.exports = { FEATURE_KEYS, MIN_EXAMPLES, MIN_PER_CLASS, train, predict };
