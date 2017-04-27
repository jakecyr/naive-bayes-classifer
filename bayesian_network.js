var BayesianNetwork = function(fileName){
    this.data = {};
    if(fileName){
        this.saveLocation = fileName;
        this.load(fileName);
    }
};

function save(fileName){
    var data = JSON.stringify(this.data);
    var fs = require('fs');

    if(this.saveLocation){
        fs.writeFileSync(this.saveLocation, data);
    }
    else{
        fs.writeFileSync(fileName, data);
    }
}

function load(fileName){
    var fs = require('fs');

    if (fs.existsSync(fileName)) {
        var buf = fs.readFileSync(fileName);
        this.data = JSON.parse(buf);
    }
    else{
        console.error(`File '${fileName}' doesn't exist`);
    }
}

function addDocuments(trainingObjArray){
    for(var i = 0; i < trainingObjArray.length; i++){
        this.addDocument(trainingObjArray[i].input.toUpperCase().split(" "), trainingObjArray[i].output.toUpperCase());
    }
}

function addDocument(list, val){

    if(typeof list == "string"){
        return this.addDocument(list.toUpperCase().split(" "), val);
    }

    val = val.toUpperCase();

    for(var i = 0; i < list.length; i++){
        if(this.data[val]){
            // console.log(list[i], this.data[val].list[list[i]])
            this.data[val].list[list[i]] = (this.data[val].list[list[i]] === undefined ? 1 : (parseInt(this.data[val].list[list[i]])||0) + 1);
            // console.log(list[i], this.data[val].list[list[i]])
        }
        else{
            this.data[val] = {"list": {}, "count": 0};
            this.data[val]["list"][list[i]] = 1;
        }
    }
    this.data[val].count = (this.data[val].count || 0) + 1;
}

function calculateProbabilities(){
    for(var key in this.data){
        var currentLabel = this.data[key];
        var currentList = currentLabel.list;
        var totalLabelCount = currentLabel.count;

        for(label in currentList){
            currentList[label] = {
                count: currentList[label],
                probability: Math.log(currentList[label])
            };
        }
    }
}

function getAllFeatureValues(){
    var featuresObj = {};

    for(var label in this.data){
        var listOfFeatures = this.data[label].list;

        for(var feature in listOfFeatures){
            featuresObj[feature] = 1;
        }
    }

    return featuresObj;
}

function getAllLabels(){
    var labelObj = {};
    for(var label in this.data) labelObj[label] = 0;
        return labelObj;
}

function getLabelTotalCount(){
    var total = 0;
    for(var label in this.data) total += this.data[label].count;
        return total;
}

function arrayToObj(array){
    var obj = {};
    for(var i = 0; i < array.length; i++) obj[array[i]] = 1;
        return obj;
}

function classify(input){

    if(typeof input == "string"){
        return this.classify(input.toUpperCase().split(" "));
    }

    var featureValues = this.getAllFeatureValues();
    var labels = this.getAllLabels();
    var totalLabelCount = this.getLabelTotalCount();

    var inputObj = this.arrayToObj(input);

    var maxValue = -100;
    var maxLabel = "";

    //Loop through each known label
    for(var label in labels){
        var list = this.data[label].list; //Get the list of feature values for the label
        var total = -Math.log(totalLabelCount);

        //Loop through each known feature value
        for(var featureValue in featureValues){
            //If the input contains the current feature value
            if(inputObj[featureValue]){
                //Get the probability and count for the current feature value
                var featureObj = this.data[label].list[featureValue];
                if(featureObj){
                    total += featureObj.probability;
                }
            }
            else{
                var featureObj = this.data[label].list[featureValue];
                if(featureObj) {
                    total += (1 - featureObj.probability);
                }
            }
        }

        //Save the probability value calculated for the label
        labels[label] = total;

        //Check if this label has the highest P so far
        if(total > maxValue){
            maxValue = total;
            maxLabel = label;
        }
    }

    //Return the prediction label and P value
    return {
        classification: {
            label: maxLabel,
            value: maxValue
        },
        labels: labels
    };
}

function toJSON(){
    return JSON.stringify(this.data);
}

function fromJSON(jsonData){
    this.data = JSON.parse(jsonData);
}

BayesianNetwork.prototype.save = save;
BayesianNetwork.prototype.load = load;
BayesianNetwork.prototype.addDocuments = addDocuments;
BayesianNetwork.prototype.addDocument = addDocument;
BayesianNetwork.prototype.calculateProbabilities = calculateProbabilities;
BayesianNetwork.prototype.getAllFeatureValues = getAllFeatureValues;
BayesianNetwork.prototype.getAllLabels = getAllLabels;
BayesianNetwork.prototype.getLabelTotalCount = getLabelTotalCount;
BayesianNetwork.prototype.arrayToObj = arrayToObj;
BayesianNetwork.prototype.classify = classify;
BayesianNetwork.prototype.toJSON = toJSON;

module.exports = BayesianNetwork;