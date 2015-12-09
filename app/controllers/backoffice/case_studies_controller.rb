class Backoffice::CaseStudiesController < BackofficeController

  before_action :set_case_study, only: [:edit, :update, :destroy]

  def index
    @case_studies = CaseStudy.all
  end

  def new
    @case_study = CaseStudy.new
  end

  def edit
  end

  def create
    @case_study = CaseStudy.new(case_studies_params)
    if @case_study.save
      redirect_to backoffice_case_studies_path
    else
      render :new
    end
  end

  def update
    if @case_study.update(case_studies_params)
      redirect_to backoffice_case_studies_path
    else
      render :edit
    end
  end

  def destroy
    @case_study.destroy
    redirect_to backoffice_case_studies_path
  end

  private

    def set_case_study
      @case_study = CaseStudy.find(params[:id])
    end

    def case_studies_params
      params.require(:case_study).permit!
    end
end
