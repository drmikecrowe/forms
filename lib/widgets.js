/*jslint node: true */
'use strict';

var is = require('is');
var tag = require('./tag');

var dataRegExp = /^data-[a-z]+([-][a-z]+)*$/;
var ariaRegExp = /^aria-[a-z]+$/;
var legalAttrs = ['autocomplete', 'autocorrect', 'autofocus', 'autosuggest', 'checked', 'dirname', 'disabled', 'tabindex', 'list', 'max', 'maxlength', 'min', 'multiple', 'novalidate', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'step', 'data-target', 'data-toggle'];
var ignoreAttrs = ['id', 'name', 'class', 'classes', 'type', 'value'];
var getUserAttrs = function (opt) {
    return Object.keys(opt).reduce(function (attrs, k) {
        if ((ignoreAttrs.indexOf(k) === -1 && legalAttrs.indexOf(k) > -1) || dataRegExp.test(k) || ariaRegExp.test(k)) {
            attrs[k] = opt[k];
        }
        return attrs;
    }, {});
};

// used to generate different input elements varying only by type attribute
var input = function (type) {
    return function (opt) {
        if (!opt) { opt = {}; }
        var userAttrs = getUserAttrs(opt);
        var w = {
            classes: opt.classes,
            type: type,
            formatValue: function (value) {
                return value || null;
            }
        };
        w.toHTML = function (name, f) {
            if (!f) { f = {}; }
            return tag('input', [{
                type: type,
                name: name,
                id: f.id === false ? false : (f.id || true),
                classes: w.classes,
                value: w.formatValue(f.value)
            }, userAttrs, w.attrs || {}]);
        };
        return w;
    };
};

exports.text = input('text');
exports.email = input('email');
exports.number = input('number');
exports.hidden = input('hidden');
exports.color = input('color');
exports.tel = input('tel');

var passwordWidget = input('password');
var passwordFormatValue = function (value) { return null; };
exports.password = function (opt) {
    var w = passwordWidget(opt);
    w.formatValue = passwordFormatValue;
    return w;
};

var dateWidget = input('date');
exports.date = function (opt) {
    var w = dateWidget(opt);
    w.formatValue = function (value) {
        if (!value) {
            return null;
        }

        var date = is.date(value) ? value : new Date(value);

        if (isNaN(date.getTime())) {
            return null;
        }

        return date.toISOString().slice(0, 10);
    };
    return w;
};

exports.checkbox = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        type: 'checkbox'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        return tag('input', [{
            type: 'checkbox',
            name: name,
            id: f.id === false ? false : (f.id || true),
            classes: w.classes,
            checked: !!f.value,
            value: 'on'
        }, userAttrs, w.attrs || {}]);
    };
    return w;
};

exports.select = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        type: 'select'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        var optionsHTML = Object.keys(f.choices).reduce(function (html, k) {
            return html + tag('option', {
                value: k,
                selected: !!(f.value && String(f.value) === String(k))
            }, f.choices[k]);
        }, '');
        return tag('select', [{
            name: name,
            id: f.id === false ? false : (f.id || true),
            classes: w.classes
        }, userAttrs, w.attrs || {}], optionsHTML);
    };
    return w;
};

exports.textarea = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        type: 'textarea'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        return tag('textarea', [{
            name: name,
            id: f.id === false ? false : (f.id || true),
            classes: w.classes,
            rows: opt.rows || null,
            cols: opt.cols || null
        }, userAttrs, w.attrs || {}], f.value || '');
    };
    return w;
};

exports.multipleCheckbox = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        labelClasses: opt.labelClasses,
        type: 'multipleCheckbox'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        return Object.keys(f.choices).reduce(function (html, k) {
            // input element
            var id = f.id === false ? false : (f.id ? f.id + '_' + k : 'id_' + name + '_' + k);
            var checked = f.value && (Array.isArray(f.value) ? f.value.some(function (v) { return String(v) === String(k); }) : String(f.value) === String(k));

            html += tag('input', [{
                type: 'checkbox',
                name: name,
                id: id,
                classes: w.classes,
                value: k,
                checked: !!checked
            }, userAttrs, w.attrs || {}]);

            // label element
            html += tag('label', {'for': id, classes: w.labelClasses}, f.choices[k]);

            return html;
        }, '');
    };
    return w;
};

exports.label = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes || []
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (forID, f) {
        return tag('label', [{
            for: forID,
            classes: w.classes
        }, userAttrs, w.attrs || {}], opt.content);
    };
    return w;
};

exports.multipleRadio = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        labelClasses: opt.labelClasses,
        type: 'multipleRadio'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        return Object.keys(f.choices).reduce(function (html, k) {
            // input element
            var id = f.id === false ? false : (f.id ? f.id + '_' + k : 'id_' + name + '_' + k);
            var checked = f.value && (Array.isArray(f.value) ? f.value.some(function (v) { return String(v) === String(k); }) : String(f.value) === String(k));

            html += tag('input', [{
                type: 'radio',
                name: name,
                id: id,
                classes: w.classes,
                value: k,
                checked: !!checked
            }, userAttrs, w.attrs || {}]);
            // label element
            html += tag('label', {'for': id, classes: w.labelClasses}, f.choices[k]);

            return html;
        }, '');
    };
    return w;
};

exports.multipleSelect = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        type: 'multipleSelect'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        var optionsHTML = Object.keys(f.choices).reduce(function (html, k) {
            var selected = f.value && (Array.isArray(f.value) ? f.value.some(function (v) { return String(v) === String(k); }) : String(f.value) === String(k));
            return html + tag('option', {
                value: k,
                selected: !!selected
            }, f.choices[k]);
        }, '');
        return tag('select', [{
            multiple: true,
            name: name,
            id: f.id === false ? false : (f.id || true),
            classes: w.classes
        }, userAttrs, w.attrs || {}], optionsHTML);
    };
    return w;
};



exports.labeledCheckboxes = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        labelClasses: opt.labelClasses,
        type: 'multipleCheckbox'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        var per_row = opt.groupColumns || 0;
        var count = 0;
        var row = 0;
        var contents = [[]];
        f.choices.forEach(function(parts) {
            // input element
            var k = Object.keys(parts)[0];
            var v = parts[k];
            var html = '';
            var id = f.id === false ? false : (f.id ? f.id + '_' + k : 'id_' + name + '_' + k);
            var checked = f.value && (Array.isArray(f.value) ? f.value.some(function (v) { return String(v) === String(k); }) : String(f.value) === String(k));

            var choiceAttr = clone(userAttrs);
            var choice_attributes = f.choice_attributes || {};
            if ( typeof choice_attributes[k] != 'undefined' ) {
                for (var ukey in choice_attributes[k]) {
                    choiceAttr[ukey] = choice_attributes[k][ukey];
                }
            }

            var input = tag('input', [{
                type: 'checkbox',
                name: name,
                id: id,
                classes: w.classes,
                value: k,
                autocomplete: 'off',
                checked: !!checked
            }, choiceAttr, w.attrs || {}]) + v;

            var classes = clone(w.labelClasses) || [];
            if ( !!checked )
                classes.push('active');
            if ( choiceAttr["disabled"] && choiceAttr["disabled"]=="disabled" )
                classes.push('disabled');

            // label element
            html += tag('label', {classes: classes}, input);

            contents[row].push(html);

            if ( per_row && ((++count % per_row)==0) ) {
                row++;
                contents[row] = [];
            }
        }, '');
        var group_tag = opt.groupTag || 'div';
        var group_classes = opt.groupClasses || [];
        var html = '';
        if ( contents[row].length > 0 )
            row++;
        for(var i=0; i<=contents.length; i++) {
            if ( typeof contents[i] != 'undefined' && contents[i].length > 0 )
                html += tag(group_tag, {classes: group_classes}, contents[i].join(''));
        }
        return html;
    };
    return w;
};

exports.labeledRadios = function (opt) {
    if (!opt) { opt = {}; }
    var w = {
        classes: opt.classes,
        labelClasses: opt.labelClasses,
        type: 'multipleRadio'
    };
    var userAttrs = getUserAttrs(opt);
    w.toHTML = function (name, f) {
        if (!f) { f = {}; }
        var per_row = opt.groupColumns || 0;
        var count = 0;
        var row = 0;
        var contents = [[]];
        f.choices.forEach(function(parts) {
            // input element
            var k = Object.keys(parts)[0];
            var v = parts[k];
            var html = '';
            var id = f.id === false ? false : (f.id ? f.id + '_' + k : 'id_' + name + '_' + k);
            var checked = f.value && (Array.isArray(f.value) ? f.value.some(function (v) { return String(v) === String(k); }) : String(f.value) === String(k));

            var choiceAttr = clone(userAttrs);
            var choice_attributes = f.choice_attributes || {};
            if ( typeof choice_attributes[k] != 'undefined' ) {
                for (var ukey in choice_attributes[k]) {
                    choiceAttr[ukey] = choice_attributes[k][ukey];
                }
            }

            var input = tag('input', [{
                type: 'radio',
                name: name,
                id: id,
                classes: w.classes,
                value: k,
                autocomplete: 'off',
                checked: !!checked
            }, choiceAttr, w.attrs || {}]) + v;
            var classes = clone(w.labelClasses) || [];
            if ( !!checked )
                classes.push('active');
            if ( choiceAttr["disabled"] && choiceAttr["disabled"]=="disabled" )
                classes.push('disabled');


            // label element
            html += tag('label', {classes: classes}, input);

            contents[row].push(html);

            if ( per_row && ((++count % per_row)==0) ) {
                row++;
                contents[row] = [];
            }
        }, '');
        var group_tag = opt.groupTag || 'div';
        var group_classes = opt.groupClasses || [];
        var html = '';
        if ( contents[row].length > 0 )
            row++;
        for(var i=0; i<=contents.length; i++) {
            if ( typeof contents[i] != 'undefined' && contents[i].length > 0 )
                html += tag(group_tag, {classes: group_classes}, contents[i].join(''));
        }
        return html;
    };
    return w;
};

function clone(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
}