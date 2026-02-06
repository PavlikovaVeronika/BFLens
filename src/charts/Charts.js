import { DataStore } from './DataStore.js';
import ClassPieChart from './charts/ClassPieChart.js';
import FactorAttributeStackedBarchart from './charts/FactorAttributeStackedBarchart.js';
import FactorClassStackedBarchart from './charts/FactorClassStackedBarchart.js';
import FactorsClassesStackedBarchart from './charts/FactorsClassesStackedBarchart.js';
import FactorsSimilarityHeatmap from './charts/FactorsSimilarityHeatmap.js';
import FactorsScatterPlot from './charts/FactorsScatterPlot.js';
import DataMatrix from './charts/DataMatrix.js';
import FactorsList from './charts/FactorsList.js';
import FactorsCoveragePlot from './charts/FactorsCoveragePlot.js';
import FactorsMDS from './charts/FactorsMDS.js';

export default class Charts {
    constructor(dataFile) {
        this.dataStore = new DataStore(dataFile);
        this.loaded = false;
        this.loadPromise = this._load();
    }

    async _load() {
        await this.dataStore.load();
        this.loaded = true;
    }

    async makeClassPieChart(element, options = {}) {
        if (!this.loaded) await this.loadPromise;
        return new ClassPieChart(element, this.dataStore, options.size, options.isZoomable,);
    }

    async makeFactorAttributeStackedBarchart(element, factorIdx, options = {}) {
        if (!this.loaded) await this.loadPromise;
        return new FactorAttributeStackedBarchart(element, factorIdx, this.dataStore, options.size, options.isZoomable, options.selectAll);
    }

    async makeFactorClassStackedBarchart(element, factorIdx, options = {}) {
        if (!this.loaded) await this.loadPromise;
        return new FactorClassStackedBarchart(element, factorIdx, this.dataStore, options.size, options.isZoomable, options.selectAll);
    }

    async makeFactorsClassesStackedBarchart(element, options = {}) {
        if (!this.loaded) await this.loadPromise;
        return new FactorsClassesStackedBarchart(element, this.dataStore, options.size, options.isZoomable,);
    }

    async makeFactorsSimilarityHeatmap(element, options = {}) {
        if (!this.loaded) await this.loadPromise;
        return new FactorsSimilarityHeatmap(element, this.dataStore, options.size, options.similarity, options.calcObj);
    }

    async makeFactorsScatterPlot(element, options = {}) {
        if (!this.loaded) await this.loadPromise;
        return new FactorsScatterPlot(element, this.dataStore, options.size, options.isZoomable,);
    }

    async makeDataMatrix(element, options = {}) {
        if (!this.loaded) await this.loadPromise;
        return new DataMatrix(element, this.dataStore, options.size);
    }

    async makeFactorsList(element, options = {}) {
        if (!this.loaded) await this.loadPromise;
        return new FactorsList(element, this.dataStore, options.size, options.markFactorCallback);
    }

    async makeFactorsCoveragePlot(element, options = {}) {
        if (!this.loaded) await this.loadPromise;
        return new FactorsCoveragePlot(element, this.dataStore, options.size, options.isZoomable,);
    }

    async makeFactorsMDS(element, options = {}) {
        if (!this.loaded) await this.loadPromise;
        return new FactorsMDS(element, this.dataStore, options.size, options.isZoomable, options.mdsTarget, options.mdsViewTarget, options.activeFactorIdx);
    }

}