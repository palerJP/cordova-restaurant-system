const recommendationTrainingModel = require('../models/recommendationTraining.model');
const recommendationService = require('./recommendation.service');
const personalizedRanker = require('./personalizedRanker');

function normalizeCount(value) {
  return Number(value) || 0;
}

function buildModelFeatures(restaurant, snapshot = {}) {
  return recommendationService._internal.scorePreferenceFeatures(restaurant, {
    preferredCuisines: snapshot.preferredCuisines || [],
    budgetRange: snapshot.budgetRange,
    dietaryRestrictions: snapshot.dietaryRestrictions || [],
    requiredServices: snapshot.requiredServices || [],
    maxDistanceKm: snapshot.maxDistanceKm || 5,
    userLat: snapshot.userLat,
    userLng: snapshot.userLng,
  });
}

async function getStatus() {
  const [stats, activeModel, versionCount, history] = await Promise.all([
    recommendationTrainingModel.getTrainingStats(),
    recommendationTrainingModel.getActiveModel(),
    recommendationTrainingModel.countVersions(),
    recommendationTrainingModel.getTrainingHistory(10),
  ]);

  const totalExamples = normalizeCount(stats.total_examples);
  const positiveExamples = normalizeCount(stats.positive_examples);
  const negativeExamples = normalizeCount(stats.negative_examples);
  const canTrain = totalExamples >= personalizedRanker.MIN_EXAMPLES &&
    positiveExamples >= personalizedRanker.MIN_PER_CLASS &&
    negativeExamples >= personalizedRanker.MIN_PER_CLASS;

  return {
    totalExamples,
    positiveExamples,
    negativeExamples,
    minimumExamples: personalizedRanker.MIN_EXAMPLES,
    minimumPerClass: personalizedRanker.MIN_PER_CLASS,
    canTrain,
    versionCount: normalizeCount(versionCount),
    recentVersions: history.map((version) => ({
      id: version.id,
      trainingExamples: normalizeCount(version.training_examples),
      positiveExamples: normalizeCount(version.positive_examples),
      negativeExamples: normalizeCount(version.negative_examples),
      trainedAt: version.created_at,
      isActive: version.is_active,
    })),
    activeModel: activeModel
      ? {
          id: activeModel.id,
          trainingExamples: activeModel.training_examples,
          positiveExamples: activeModel.positive_examples,
          negativeExamples: activeModel.negative_examples,
          trainedBy: activeModel.trained_by,
          trainedAt: activeModel.created_at,
        }
      : null,
  };
}

async function trainModel(trainedBy) {
  const examples = await recommendationTrainingModel.getTrainingExamples();
  const trained = personalizedRanker.train(examples, buildModelFeatures);

  if (!trained.model) {
    return {
      trained: false,
      reason: 'insufficient_feedback',
      trainingExamples: trained.feedbackCount,
      positiveExamples: trained.positiveCount,
      negativeExamples: trained.negativeCount,
      minimumExamples: personalizedRanker.MIN_EXAMPLES,
      minimumPerClass: personalizedRanker.MIN_PER_CLASS,
    };
  }

  const version = await recommendationTrainingModel.saveTrainedModel({
    model: trained.model,
    trainingExamples: trained.feedbackCount,
    positiveExamples: trained.positiveCount,
    negativeExamples: trained.negativeCount,
    trainedBy,
  });

  return {
    trained: true,
    trainingExamples: version.training_examples,
    positiveExamples: version.positive_examples,
    negativeExamples: version.negative_examples,
    model: {
      id: version.id,
      trainingExamples: version.training_examples,
      positiveExamples: version.positive_examples,
      negativeExamples: version.negative_examples,
      trainedAt: version.created_at,
    },
  };
}

module.exports = { getStatus, trainModel };
