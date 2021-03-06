source 'https://rubygems.org'

ruby '2.2.2'

gem 'rails', '4.2.5'

# Rails plugins
gem 'httmultiparty'
gem 'dotenv-rails'
gem 'puma'
gem 'gon'
gem 'active_model_serializers'
gem "enumerate_it"

# Assets managment
gem 'sass-rails', '~> 5.0'
gem 'uglifier', '>= 1.3.0'
gem 'coffee-rails', '~> 4.1.0'
gem 'jquery-rails'
gem 'autoprefixer-rails'

# Templating
gem 'slim-rails'
gem 'simple_form'
gem 'cocoon'

# Rails Assets is the frictionless proxy between Bundler and Bower
source 'https://rails-assets.org' do
  gem 'rails-assets-normalize-css'
  gem 'rails-assets-d3'
  gem 'rails-assets-underscore'
  gem 'rails-assets-backbone'
  gem 'rails-assets-jquery.tagsinput', '~> 1.3.6'
  gem 'rails-assets-slick.js'
end

# Lightbox
gem 'featherlight'

# Text parser
gem "redcarpet"

# Active record
gem 'pg', '~> 0.15'
gem 'paperclip', '~> 4.3'
gem 'acts-as-taggable-on', '~> 3.4'
gem 'devise'
gem 'deep_cloneable', '~> 2.1.1'

# Jobs managment
gem 'resque', "~> 1.22.0"
gem 'resque-pool'

# API
# gem 'sdoc', '~> 0.4.0', group: :doc

group :development, :test do
  gem 'byebug'
  gem 'i18n_yaml_sorter'
  gem "i18n-tasks"
end

group :development do
  gem 'web-console', '~> 2.0'
  gem 'spring'
end

group :test do
  gem 'rspec-rails', '~> 3.0'
  gem 'factory_girl_rails'
  gem 'faker'
end

group :production do
  gem 'aws-sdk', '< 2.0'
  gem 'rails_12factor' # Required for Heroku
end
