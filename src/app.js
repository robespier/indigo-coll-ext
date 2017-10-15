(function () {
  var app = angular.module('ice', []);
  app.controller('ext', ['$scope', function ($scope) {


    /** Проверка доступности ресурсов (сетевых дисков)
     *
     *
     */

    var fs = require('fs');
    var templateRoot = 'T:';
    var jobcontainerRoot = 'Y:';
    var hotfolderRoot = 'H:';
    fs.stat(templateRoot, function (err, stats) {
      if (err) {
        alert("Подключите сетевой диск 'T' для директории с шаблонами.\nДля закрытия этого окна нажмите клавишу 'Esc'");
      } else {
        fs.stat(jobcontainerRoot, function (err, stats) {
          if (err) {
            alert("Подключите сетевой диск 'Y' для директории с рабочими файлами.\nДля закрытия этого окна нажмите клавишу 'Esc'");
          } else {
            fs.stat(hotfolderRoot, function (err, stats) {
              if (err) {
                alert("Подключите сетевой диск 'H' для директории с 'горячими' папками.\nДля закрытия этого окна нажмите клавишу 'Esc'");
              }
            });
          }
        });
      }
    });

    $scope.workset = {
      template: {
        number: '',
        message: 'Введите номер шаблона',
        status: 'undefined',
      },
      roll_method: [{
        value: 'hand',
        name: 'Ручная',
      },
      {
        value: 'auto',
        name: 'Автоматическая',
      },
      ],
      roll_type: [{
        value: 'outside',
        name: 'Наружная',
      },
      {
        value: 'inside',
        name: 'Внутренняя',
      },
      ],
      roll_direct: [{
        value: 'head_mashine',
        name: 'Головой к машине',
      },
      {
        value: 'foot_mashine',
        name: 'Ногами к машине',
      },
      {
        value: 'foot_forward',
        name: 'Ногами вперед',
      },
      {
        value: 'head_forward',
        name: 'Головой вперед',
      },
      ],
      roll_number: 0,
      select: [{
        value: true,
      },
      {
        value: false,
      },
      ],
      label_stock: [],
      inks: [{
        name: 'Opaque',
        label: 'white',
        used: false,
      },
      {
        name: 'Cyan',
        label: 'cyan',
        used: true,
      },
      {
        name: 'Magenta',
        label: 'magenta',
        used: true,
      },
      {
        name: 'Yellow',
        label: 'yellow',
        used: true,
      },
      {
        name: 'Black',
        label: 'black',
        used: true,
      },
      {
        name: 'Orange',
        label: 'orange',
        used: false,
      },
      {
        name: 'Violet',
        label: 'blue',
        used: false,
      },
      ],
      hot_folder: 'CMYK',
      collection_type: [{
        value: 'standart',
        name: 'Стандартная',
        used: true,
      },
      {
        value: 'approve',
        name: 'Утверждение',
        used: false,
      },
      {
        value: 'divider',
        name: 'Разделитель',
        used: false,
      },
      ],
    };

    /**
     * Значения по умолчанию
     */
    $scope.default = {
      roll_method: $scope.workset.roll_method[0].value,
      roll_type: $scope.workset.roll_type[0].value,
      roll_direct: $scope.workset.roll_direct[0].value,
      roll_number: $scope.workset.roll_number,
      select: $scope.workset.select[0].value,
    };

    /**
     * Переводит массив '0'/'1' из двоичной системы в десятичную
     *
     * @param {array} dec Array
     * @return {int} out
     */
    function toDEC(dec) {
      var out = 0;
      var len = dec.length;
      var bit = 1;
      while (len--) {
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
          hotfolderName = 'CMYK';
        } else {
          hotfolderName = 'CMYKW';
        }
      } else {
        hotfolderName = 'CMYKOV_White';
      }
      return hotfolderName;
    }

    /**
     * Вычислять хотфолдер при клике по красочности
     */
    $scope.calcHF = function () {
      var inks = toDEC(this.workset.inks);
      this.workset.hot_folder = getHotFolder(inks);
    };

    /**
     * Задает метод намотки
     *
     */

    $scope.setRollMethod = function (method, type, direct) {
      var number;
      switch (method) {
        case 'hand':
          number = 0;
          this.workset.roll_number = number;
          this.default.select = true;
          break;
        case 'auto':
          number = this.getRollNumber(type, direct);
          this.default.roll_number = number;
          this.default.select = false;
          break;
        default:
      }
    };


    /**
     * Определяет номер намотки
     *
     */
    $scope.getRollNumber = function (rtype, rdirect) {
      var rnumber;
      if ((rtype === 'outside') && (rdirect === 'head_mashine')) {
        rnumber = 1;
      }
      if ((rtype === 'inside') && (rdirect === 'head_mashine')) {
        rnumber = 6;
      }
      if ((rtype === 'outside') && (rdirect === 'foot_mashine')) {
        rnumber = 2;
      }
      if ((rtype === 'inside') && (rdirect === 'foot_mashine')) {
        rnumber = 5;
      }
      if ((rtype === 'outside') && (rdirect === 'foot_forward')) {
        rnumber = 3;
      }
      if ((rtype === 'inside') && (rdirect === 'foot_forward')) {
        rnumber = 7;
      }
      if ((rtype === 'outside') && (rdirect === 'head_forward')) {
        rnumber = 4;
      }
      if ((rtype === 'inside') && (rdirect === 'head_forward')) {
        rnumber = 8;
      }
      this.workset.roll_number = rnumber;
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

    /**
     * Добавление этикеток
     *
     */

    $scope.addLabels = function () {
      var path = require('path');
      var dialog = cep.fs.showOpenDialog(true, false, 'Выберите этикетки', 'Y:', ['eps']);
      if (dialog.err) {
        console.log('что-то пошло не так...');
      } else {
        for (var i = 0; i < dialog.data.length; i++) {
          if (path.extname(dialog.data[i]) === '.eps') {
            this.workset.label_stock.push(dialog.data[i]);
          }
        }
        setCollType(this.workset.label_stock.length);
      }
    };

    /**
     * Удаление этикеток
     *
     */

    $scope.removeLabels = function () {
      this.workset.label_stock.splice(0, this.workset.label_stock.length);
      setCollType(this.workset.label_stock.length);
    };

    /**
     * Получение имени этикетки из строки
     *
     */

    $scope.getLabelName = function (label) {
      var path = require('path');
      var name = path.basename(label, '.eps');
      return name;
    };

    /**
     * Валидация номера шаблона
     *
     */

    $scope.validateTemplate = function () {
      var template = $scope.workset.template.number;
      if (template === '') {
        $scope.workset.template.message = 'Bведите номер шаблона';
      } else {
        var fs = require('fs');
        var templateRoot = 'T:';
        fs.readdir(templateRoot, function (err, files) {
          if (err) {
            alert('Папка шаблонов пуста');
          } else {
            for (var i = 0; i < files.length; i++) {
              if (template + '.ait' === files[i]) {
                $scope.workset.template.message = 'Шаблон найден';
                break;
              } else {
                $scope.workset.template.message = 'Шаблон не найден';
              }
            }
          }
        });
      }
    };
  }]);

})();
