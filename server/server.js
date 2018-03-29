var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require("./resources/logger");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(require("morgan")("combined", { "stream": logger.stream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));
//app.use(express.static('client'));

app.use('/', index);
var generateClientToken = function(){
  var date = new Date();
  return date.getMilliseconds();
};

var AWS = require('aws-sdk');
//AWS.config.update({region:'us-east-2'});
AWS.config.loadFromPath('./../awsconfig.json');

var cloudformation = new AWS.CloudFormation();

app.post('/aws/stack', function(req, res, next){

  try{ 
    console.log("Processing create stack request");
    
    console.log(req.body);

    var stackName = req.body.stackName;
    var hookName = req.body.hookName;
    var templateUrl = req.body.templateUrl;

    var params = {
      StackName: stackName, /* required */
      Capabilities: [
        "CAPABILITY_NAMED_IAM"
      ],
      ClientRequestToken: 'Service-CreateStack-'+generateClientToken(),
      //DisableRollback: false,
      EnableTerminationProtection: false,
      /*NotificationARNs: [
        'STRING_VALUE',
      ],*/
      OnFailure: "ROLLBACK",
      Parameters: [
        {
          ParameterKey: 'HookName',
          ParameterValue: hookName,
          ResolvedValue: '',
          UsePreviousValue: false
        }
      ],
      /*ResourceTypes: [
        'STRING_VALUE',
      ],
      RoleARN: 'STRING_VALUE',
      RollbackConfiguration: {
        MonitoringTimeInMinutes: 0,
        RollbackTriggers: [
          {
            Arn: 'STRING_VALUE', 
            Type: 'STRING_VALUE' 
          },
        ]
      },
      StackPolicyBody: 'STRING_VALUE',
      StackPolicyURL: 'STRING_VALUE',
      Tags: [
        {
          Key: 'STRING_VALUE', 
          Value: 'STRING_VALUE' 
        },
      ],*/
      //TemplateBody: 'STRING_VALUE',
      TemplateURL: templateUrl,
      TimeoutInMinutes: 10
    };
    console.log("Create Stack Params: "+JSON.stringify(params));

    cloudformation.createStack(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        res.status(500).send("Failure");
      }
      else {
        console.log(data);           // successful response
        res.send(data);
      }
    });
  }
  catch(exp){
    console.log("Exception: ", exp);
    res.status(500).send("Failed with excpetion");
  }
});


app.get('/aws/stack/events/:stackName', function(req, res, next){
  
  var stackName = req.params.stackName;
  var params = {
    StackName: stackName
  };
  console.log("Fetching Stack Status");
  cloudformation.describeStackEvents(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      res.status(500).send("Failure");
    }
    else {
      console.log(data);           // successful response
      res.send(data);
    }
  });
});


app.get('/aws/stacks/:stackName', function(req, res, next){
  
  var stackName = req.params.stackName;
  var params = {
    StackName: stackName
  };
  console.log("Fetching Stack Status");
  cloudformation.describeStacks(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      res.status(500).send("Failure");
    }
    else {
      console.log(data);           // successful response
      res.send(data);
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
