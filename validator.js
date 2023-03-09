function Validator(formSelector) {
    var _this = this;
    function getParent (element, selector) {
        while (element) {
            if (element.matches(selector)) {
                return element 
            } else {
                element = element.parentElement;
            }
        }
    }
    var formRules = {} ;
    var validatorRules = {
        required: function(value) {
            return value ? undefined : "Vui lòng nhập trường này";
        },
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Vui lòng nhập email";
        },
        min: function(min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`
            }
        },
        max: function(max) {
            return function (value) {
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} kí tự`
            }
        },
    };
    var formElement = document.querySelector(formSelector);
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {
            var rules = input.getAttribute("rules").split("|");
            for (var rule of rules) {
                var isRuleHasValue = rule.includes(':');
                var ruleInfo;
                if (isRuleHasValue) {
                    ruleInfo = rule.split(":");
                    rule = ruleInfo[0];
                }
                var ruleFunc = validatorRules[rule];
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }
        function handleValidate(e) {
            var rules = formRules[e.target.name];
            var errorMessage;
            for (var rule of rules) {
                errorMessage = rule(e.target.value);
                if (errorMessage) {
                    break;
                }
            }
            if (errorMessage) {
                var formGroup = getParent(e.target, '.form-group');
                if (formGroup) {
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            } 
            return !errorMessage;
        }
        function handleClearError (e) {
            var formGroup = getParent(e.target, '.form-group');
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
                var formMessage = formGroup.querySelector('.form-message');
                if (formMessage) {
                    formMessage.innerText = ''; 
                }
            }
        }
    }
    formElement.onsubmit = function(e) {
        e.preventDefault();
        var isValid = true;
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {
            if (!handleValidate({target: input})) {
                isValid = false;
            }
        }
        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name][rules]');
                var formValues = Array.from(enableInputs).reduce(function(values, input) {
                    switch(input.type) {
                        case 'radio':
                            if (input.matches(':checked')) {
                                values[input.name] = input.value;
                            } else { return values; }
                            break;
                        case 'checkbox':
                            if (input.matches(':checked')) {
                                if(Array.isArray(values[input.name])) {
                                    values[input.name].push(input.value);
                                } else {
                                    values[input.name] = [input.value];
                                }
                            } else {return values;}
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default: 
                            values[input.name] = input.value;
                            break;
                        }
                       
                    return values;
                },{});
                _this.onSubmit(formValues);
            } else 
            formElement.submit();
        }
    }
}