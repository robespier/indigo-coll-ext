(function() {
  var app = angular.module("ice", []);
  app.controller("ext", ["$scope", function($scope) {

/**
 * Значения по умолчанию
 */
      $scope.workset = {
        template_number: "",
        roll_method: "hand",
        roll_type: "outside",
        roll_direct: "head_forward",
        label_stock: [],
        inks: [
  				{name: "Opaque", label: "white", used: false},
  				{name: "Cyan", label: "cyan", used: true},
  				{name: "Magenta", label: "magenta", used: true},
  				{name: "Yellow", label: "yellow", used: true},
  				{name: "Black", label: "black", used: true},
  				{name: "Orange", label: "orange", used: false},
  				{name: "Violet", label: "blue", used: false},
  			],
        hot_folder: "CMYK",
        collection_type: "standart",
      };

/**
 * Вычислять хотфолдер при клике по красочности
 */
      $scope.calcHF = function() {
      	var inks = toDEC(this.workset.inks);
      	this.workset.hot_folder = getHotFolder(inks);
      };


/**
 * Переводит массив "0"/"1" из двоичной системы в десятичную
 *
 * @param {array} dec Array
 * @return {int} out
 */
  		function toDEC(dec) {
  			var out = 0, len = dec.length, bit = 1;
  			while(len--) {
  				out += dec[len].used ? bit : 0;
  				bit <<= 1;
  			}
  			return out;
  		}

/**
 * Определяет hotfolder исходя из красочности задания
 *
 * @param {int} num
 * @return {string} hotfolderName
 */
  		function getHotFolder(num) {
  			var hotfolderName = '';
  			if (num % 4 === 0) {
  				if (num <= 60) {
  					hotfolderName = "CMYK";
  				} else {
  				hotfolderName = "CMYKW";
  				}
  			} else {
  				hotfolderName = "CMYKOV_White";
  			}
  			return hotfolderName;
  		}

/**
* Задает направление намотки
*
*
*/
      $scope.getRoll = function() {
        var roll;
        if((this.workset.roll_type==='outside')&&(this.workset.roll_dir==='head_mashine')){
          roll='roll_1_6';
        }
        if((this.workset.roll_type==='inside')&&(this.workset.roll_dir==='head_mashine')){
          roll='roll_1_6';
        }
        if((this.workset.roll_type==='outside')&&(this.workset.roll_dir==='foot_mashine')){
          roll='roll_2_5';
        }
        if((this.workset.roll_type==='inside')&&(this.workset.roll_dir==='foot_mashine')){
          roll='roll_2_5';
        }
        if((this.workset.roll_type==='outside')&&(this.workset.roll_dir==='foot_forward')){
          roll='roll_3_7';
        }
        if((this.workset.roll_type==='inside')&&(this.workset.roll_dir==='foot_forward')){
          roll='roll_3_7';
        }
        if((this.workset.roll_type==='outside')&&(this.workset.roll_dir==='head_forward')){
          roll='roll_4_8';
        }
        if((this.workset.roll_type==='inside')&&(this.workset.roll_dir==='head_forward')){
          roll='roll_4_8';
        }
        $scope.workset.roll = roll;
        return roll;
      };
  }]);
})();
