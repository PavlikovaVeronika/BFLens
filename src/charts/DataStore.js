export class DataStore {

  constructor(filePath) {
    this.filePath = filePath;
  }

  async load() {
    const response = await fetch(this.filePath);
    const json = await response.json();
    this.data = json.data;
    this.objects = json.objects;
    this.attributes = json.attributes;
    this.factors = json.factors;
    if (json.class && json.classDescription) {
      this.class = json.class;
      this.classDescription = [].concat(json.classDescription ?? []);
    }
    if(json.coverage) {
      this.coverage = json.coverage;
    }
    if(json.mds) {
      this.mds = json.mds;
    }
    
  }

  getData() {
    const numAttributes = this.attributes.length;

    const binaryMatrix = this.data.map(row => {
      const indices = Array.isArray(row) ? row : [row];

      const binaryRow = Array(numAttributes).fill(0);

      indices.forEach(attrIndex => {
        if (
          Number.isInteger(attrIndex) &&
          attrIndex >= 0 &&
          attrIndex < numAttributes
        ) {
          binaryRow[attrIndex] = 1;
        }
      });

      return binaryRow;
    });

    return binaryMatrix;
  }


  getObjects() {
    return this.objects;
  }

  getAttributes() {
    return this.attributes;
  }

  getFactors() {
    return this.factors;
  }

  getClasses() {
    return this.class;
  }

  getClassDescription() {
    return this.classDescription;
  }

  getCoverage() {
    return this.coverage;
  }

  getMDS(similarity) {
    return this.mds.find(m => m.name === similarity) || null;
  }

  getClassDistributionInPercentage() {
    const classCounts = this.classDescription.map(() => 0);

    this.class.forEach(index => {
      if (index >= 0 && index < classCounts.length) {
        classCounts[index]++;
      }
    });

    const total = classCounts.reduce((a, b) => a + b, 0);

    return this.classDescription.map((label, i) => ({
      label,
      value: total > 0 ? Number(((classCounts[i] / total) * 100).toFixed(2)) : 0
    }));
  }

  getClassDistributionInNumbers() {
    const classCounts = this.classDescription.map(() => 0);

    this.class.forEach(index => {
      if (index >= 0 && index < classCounts.length) {
        classCounts[index]++;
      }
    });

    return this.classDescription.map((label, idx) => ({
      label,
      value: classCounts[idx]
    }));
  }

  getFactorClassDistributionInNumbers(factorIdx) {
    const factor = this.factors[factorIdx];
    const classCounts = this.classDescription.map(() => 0);

    factor.objects.forEach(objId => {
      const classIndex = this.class[objId];
      if (classIndex >= 0 && classIndex < classCounts.length) {
        classCounts[classIndex]++;
      }
    });

    return this.classDescription.map((label, idx) => ({
      label,
      value: classCounts[idx]
    }));
  }

  getFactorsClassesDistributionInNumbers() {
    return this.factors.map((factor, factorIdx) => {
      const classCounts = this.classDescription.map(() => 0);

      factor.objects.forEach(objId => {
        const classIndex = this.class[objId];
        if (classIndex >= 0 && classIndex < classCounts.length) {
          classCounts[classIndex]++;
        }
      });

      const distribution = this.classDescription.map((label, idx) => ({
        label,
        value: classCounts[idx]
      }));

      return {
        factorIdx,
        distribution
      };
    });
  }

  getAttributeDistribution() {
    const attributesCounts = this.attributes.map(() => 0);

    this.data.forEach(item => {
      item.forEach(attrIndex => {
        if (attrIndex >= 0 && attrIndex < attributesCounts.length) {
          attributesCounts[attrIndex]++;
        }
      });
    });

    return this.attributes.map((label, idx) => ({
      label,
      value: attributesCounts[idx]
    }));
  }

  getFactorAttributeDistribution(factorIdx) {
    const factor = this.factors[factorIdx];
    const objectCount = factor.objects.length;
    const attributeCounts = this.attributes.map(() => 0);

    factor.attributes.forEach(attrIdx => {
      if (attrIdx >= 0 && attrIdx < attributeCounts.length) {
        attributeCounts[attrIdx] = objectCount;
      }
    });

    return this.attributes.map((label, idx) => ({
      label,
      value: attributeCounts[idx]
    }));
  }

  getFactorsForDisplay() {
    return this.factors.map(factor => ({
      ...factor,
      objectNames: factor.objects.map(id => this.objects[id]),
      attributeNames: factor.attributes.map(id => this.attributes[id])
    }));
  }

}
