/* eslint-disable no-param-reassign */
const fixNullValuesOnBuckets = (elasticResponse) => {
  try {
    const responseNew = { ...elasticResponse };
    responseNew?.responses?.forEach((response) => {
      const bucket = response.aggregations;
      if (bucket) {
          if (bucket?.min?.value === null) {
            bucket.min.value = 0;
          }
          if (bucket?.max?.value === null) {
            bucket.max.value = 2.147483647;
          }
      }
    });
    return responseNew || elasticResponse;
  } catch (err) {
    return elasticResponse;
  }
};

module.exports = fixNullValuesOnBuckets;
