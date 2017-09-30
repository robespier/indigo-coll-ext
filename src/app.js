(function() {
  var app = angular.module("ice", []);
  app.controller("ext", ["$scope", function($scope) {

      $scope.workset = {
        template_number: "",
        roll_method: [
          {value: "hand", name: "Ручная"},
          {value: "auto", name: "Автоматическая"}
        ],
        roll_type: [
          {value: "outside", name: "Наружная"},
          {value: "inside", name: "Внутренняя"}
        ],
        roll_direct: [
          {value: "head_mashine", name: "Головой к машине"},
          {value: "foot_mashine", name: "Ногами к машине"},
          {value: "foot_forward", name: "Ногами вперед"},
          {value: "head_forward", name: "Головой вперед"}
        ],
        roll_number: 0,
        select: [
          {value: true},
          {value: false}
        ],
        label_stock: [],
        inks: [
  				{name: "Opaque", label: "white", used: false},
  				{name: "Cyan", label: "cyan", used: true},
  				{name: "Magenta", label: "magenta", used: true},
  				{name: "Yellow", label: "yellow", used: true},
  				{name: "Black", label: "black", used: true},
  				{name: "Orange", label: "orange", used: false},
  				{name: "Violet", label: "blue", used: false}
  			],
        hot_folder: "CMYK",
        collection_type: [
          {value: "standart", name: "Стандартная", used: true},
          {value: "approve", name: "Утверждение", used: false},
          {value: "divider", name: "Разделитель", used: false}
        ]
      };

    /**
     * Значения по умолчанию
     */
    $scope.default = {
      roll_method: $scope.workset.roll_method[0].value,
      roll_type: $scope.workset.roll_type[0].value,
      roll_direct: $scope.workset.roll_direct[0].value,
      roll_number: $scope.workset.roll_number,
      select: $scope.workset.select[0].value
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
      var out = 0,
        len = dec.length,
        bit = 1;
      while (len--) {
        out += dec[len].used ? bit : 0;
        bit <<= 1;
      }
      return out;
    };

    /**
     * Определяет hotfolder исходя из красочности задания
     *
     * @param {int} num
     * @return {string} hotfolderName
     */
    function getHotFolder(num) {
      var hotfolderName = "";
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
    };

    /**
     * Задает метод намотки
     *
     */

    $scope.setRollMethod = function(roll_method, roll_type, roll_direct) {
      var roll_number;
      switch (roll_method) {
        case "hand":
          roll_number = 0;
          this.workset.roll_number = roll_number;
          this.default.select = true;
          break;
        case "auto":
          roll_number = this.getRollNumber(roll_type, roll_direct);
          this.default.roll_number = roll_number;
          this.default.select = false;
          break;
      }
    };


    /**
     * Определяет номер намотки
     *
     */
    $scope.getRollNumber = function(r_type, r_direct) {
      var r_number;
      if ((r_type === "outside") && (r_direct === "head_mashine")) {
        r_number = 1;
      }
      if ((r_type === "inside") && (r_direct === "head_mashine")) {
        r_number = 6;
      }
      if ((r_type === "outside") && (r_direct === "foot_mashine")) {
        r_number = 2;
      }
      if ((r_type === "inside") && (r_direct === "foot_mashine")) {
        r_number = 5;
      }
      if ((r_type === "outside") && (r_direct === "foot_forward")) {
        r_number = 3;
      }
      if ((r_type === "inside") && (r_direct === "foot_forward")) {
        r_number = 7;
      }
      if ((r_type === "outside") && (r_direct === "head_forward")) {
        r_number = 4;
      }
      if ((r_type === "inside") && (r_direct === "head_forward")) {
        r_number = 8;
      }
      this.workset.roll_number = r_number;
    };

    /**
     * Добавление этикеток
     *
     */

      $scope.addLabels = function () {
        var dialog = cep.fs.showOpenDialog(true, false, "Выберите этикетки", "Y:", ["eps"]);
        if(dialog.err) {
          alert("что-то пошло не так...")
        } else {
            for (var i = 0; i < dialog.data.length; i++) {
              this.workset.label_stock.push(dialog.data[i]);
            };
            var length = this.workset.label_stock.length;
            setCollType(length);
          }
      };

    /**
     * Удаление этикеток
     *
     */

     $scope.removeLabels = function () {
        this.workset.label_stock.splice(0, this.workset.label_stock.length);
        var length = this.workset.label_stock.length;
        setCollType(length);
     };

     /**
     * Определение типа верстки в зависимости от кол-ва этикеток
     *
     */

     function setCollType(len) {
       if (len > 1) {
         $scope.workset.collection_type[0].used = true;
         $scope.workset.collection_type[1].used = true;
         $scope.workset.collection_type[2].used = true;
       } else {
         $scope.workset.collection_type[0].used = true;
         $scope.workset.collection_type[1].used = false;
         $scope.workset.collection_type[2].used = false;
         }
     }
  }]);

  /**
   * Проверка доступности ресурсов (сетевых дисков)
   *
   * Для нормальной работы приложения должны быть подключены три сетевых диска:
    - Диск "T" - template
    - Диск "Y" - jobcontainer
    - Диск "H" - hotfolder
   */

  var fs = require("fs");
  var template_root = "T:";
  var jobcontainer_root = "Y:";
  var hotfolder_root = "H:";
  fs.stat(template_root, function(err, stats) {
    if (err) {
      alert("Подключите сетевой диск 'T' для директории с шаблонами.\nДля закрытия этого окна нажмите клавишу 'Esc'");
    } else {
      fs.stat(jobcontainer_root, function(err, stats) {
        if (err) {
          alert("Подключите сетевой диск 'Y' для директории с рабочими файлами.\nДля закрытия этого окна нажмите клавишу 'Esc'");
        } else {
          fs.stat(hotfolder_root, function(err, stats) {
            if (err) {
              alert("Подключите сетевой диск 'H' для директории с 'горячими' папками.\nДля закрытия этого окна нажмите клавишу 'Esc'");
            }
          })
        }
      })
    }
  });

})();
