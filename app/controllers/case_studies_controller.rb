class CaseStudiesController < ApplicationController

  before_action :restrict_access!, only: [:index]
  after_action :check_case_study

  def index
    if case_studies_params[:search]
      @case_study = CaseStudy.published.search(case_studies_params[:search])
      render json: @case_study
    elsif case_studies_params[:tags]
      @case_study = CaseStudy.published.get_tag_filtered(case_studies_params).limit(9)
      render json: @case_study
    else
      @case_study = CaseStudy.published.limit(9)
      render json: @case_study
    end
  end

  def show
    @tags = Tag.all
    @case_study = CaseStudy.published.where(slug: params[:slug]).first
    @tab = params[:tab]

    gon.case_study = @case_study.
      as_json(include: [:contacts, {valid_pages: {include: [:data_layers, :charts, :interest_points]}}])
    gon.cartodb_user = ENV["CDB_USERNAME"]
  end

  def preview
    if user_signed_in?
      @tags = Tag.all
      @case_study = CaseStudy.where(slug: params[:slug]).first

      gon.case_study = @case_study.
        as_json(include: [:contacts, {valid_pages: {include: [:data_layers, :charts, :interest_points]}}])
      gon.cartodb_user = ENV["CDB_USERNAME"]
    else
      not_found
    end
  end

  private

    def check_case_study
      unless @case_study
        not_found
      end
    end

    def case_studies_params
      params.permit(:search, tags:[])
    end

    def restrict_access!
      redirect_to backoffice_dashboard_path unless user_signed_in?
    end

end
