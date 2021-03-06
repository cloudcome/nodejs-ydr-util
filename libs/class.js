/*!
 * 类的继承与创建
 * @author ydr.me
 * @create 2014-11-22 15:00
 */

'use strict';


var dato = require('./dato.js');
var typeis = require('./typeis.js');

/**
 * 单继承
 * @param {Function} constructor 子类
 * @param {Function} superConstructor 父类
 * @param {Boolean} [isCopyStatic=false] 是否复制静态方法
 * @link https://github.com/joyent/node/blob/master/lib/util.js#L628
 *
 * @example
 * // 父类
 * var Father = function(){};
 *
 * // 子类
 * var Child = function(){
 *     // 执行一次父类的方法
 *     Father.apply(this, arguments);
 *
 *     // 这里执行子类的方法、属性
 *     this.sth = 123;
 * };
 *
 * klass.inherit(Child, Father);
 *
 * // 这里开始写子类的原型方法
 * Child.prototype = {};
 */
exports.inherit = function (constructor, superConstructor, isCopyStatic) {
    constructor.super_ = superConstructor;
    //var F = function () {
    //    // ignore
    //};
    //F.prototype = new superConstructor();
    //constructor.prototype = new F;
    constructor.prototype = Object.create(superConstructor.prototype, {
        constructor: {
            value: constructor,
            // 是否可被枚举
            enumerable: true,
            // 是否可被重写
            writable: true,
            // 是否可被修改
            configurable: true
        }
    });

    if (isCopyStatic) {
        dato.extend(true, constructor, superConstructor);
    }
};



/**
 * 创建一个类（构造函数）
 * @param {Function} constructor 构造函数
 * @param {Function} [superConstructor=null] 父类
 * @param {Boolean} [isInheritStatic=false] 是否继承父类的静态方法
 *
 * @example
 * var Father = klass.create(function(name){
 *     this.name = name;
 * });
 *
 * var pro = Father.prototype;
 *
 * pro.sayName = function(){
 *     console.log(this.name);
 * };
 *
 * var Child = klass.create(function(name, age){
 *    this.age = age;
 * }, Father, true);
 *
 * Child.fn.speak = function(){
 *     console.log('My name is ' + this.name + ', I\'m ' + this.age + ' years old.');
 * };
 *
 * var f1 = new Father('Fimme');
 * var c1 = new Child('Cmoo', 20);
 */
exports.create = function (constructor, superConstructor, isInheritStatic) {
    var isConstructorFn = typeis.function(constructor);
    var isSuperConstructorFn = typeis.function(superConstructor);
    var c = function () {
        if (isSuperConstructorFn) {
            superConstructor.apply(this, arguments);
        }

        if (isConstructorFn) {
            return constructor.apply(this, arguments);
        }
    };

    if (isConstructorFn && isSuperConstructorFn) {
        exports.inherit(c, superConstructor, isInheritStatic);
    }

    c.fn = c.prototype;
    c.prototype.constructor = c;
    c.prototype.extend = function(properties){
        dato.extend(true, c.prototype, properties);
    };
    c.extend = function (properties) {
        dato.extend(true, c, properties);
    };

    return c;
};